"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { z } from "zod"

import { notifyRops, sendEmail, siteUrl } from "@/lib/email"
import { ROLE_COOKIE, ROLES, toRole, type Role } from "@/lib/role"
import { getSupabaseAdmin } from "@/lib/supabase"
import { MESSAGE_TOPICS, type MessageRecipient } from "@/seed"

export type DbMessage = {
  id: string
  subject: string
  role: string
  recipient: MessageRecipient
  link: string | null
  body: string
  date: string
  answered: boolean
  replyBody?: string
  hasEmail: boolean
}

type MessageRow = {
  id: string
  created_at: string
  subject: string
  role: string
  body: string
  answered: boolean
  reply_body: string | null
  email: string | null
  recipient: MessageRecipient
  link: string | null
}

const fromLabel = (recipient: MessageRecipient) => (recipient === "mentor" ? "mentora" : "ROPS Kraków")

const messageSchema = z.object({
  recipient: z.enum(["rops", "mentor"]),
  topic: z.string().refine((t) => MESSAGE_TOPICS.includes(t), "Wybierz temat pytania."),
  body: z.string().trim().min(1, "Wpisz treść pytania.").max(5000),
  email: z.email("Podaj poprawny adres e-mail — wyślemy na niego odpowiedź."),
  consent: z.literal("on", "Zaznacz zgodę na kontakt w tej sprawie."),
  // Sprawa, której dotyczy pytanie: tylko strony innowacji i pomysłów z tej aplikacji.
  link: z.union([z.literal(""), z.string().regex(/^\/(innowacja|kreator)\/[0-9a-f-]{36}$/)]).default(""),
  about: z.string().trim().max(200).default(""),
})

export type SendState = { error: string } | null

export async function sendMessageAction(_prev: SendState, formData: FormData): Promise<SendState> {
  const parsed = messageSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { recipient, topic, body, email, link, about } = parsed.data

  const role = toRole((await cookies()).get(ROLE_COOKIE)?.value)
  const roleLabel = ROLES.find((r) => r.value === role)?.label ?? "Mieszkaniec"
  const subject = about ? `${topic}: ${about}` : topic

  const { data, error } = await getSupabaseAdmin()
    .from("messages")
    .insert({ subject, role: roleLabel, body, email, recipient, link: link || null })
    .select("id")
    .single()
  if (error || !data) {
    console.error("Zapis wiadomości:", error)
    return { error: "Nie udało się wysłać pytania. Spróbuj ponownie za chwilę." }
  }

  // Po odpowiedzi do przeglądarki — e-mail nie spowalnia formularza.
  after(() =>
    notifyRops(
      `Nowe pytanie do ${fromLabel(recipient)}: ${subject}`,
      `${roleLabel} pyta:\n\n${body}\n\nSprawa: ${siteUrl(`/wiadomosci/${data.id}`)}`
    )
  )
  revalidatePath("/panel")
  revalidatePath("/mentor")
  redirect(`/wiadomosci/${data.id}`)
}

/** Sprawa widziana przez autora — bez adresu e-mail. */
export async function getMessage(id: string) {
  if (!z.uuid().safeParse(id).success) return null
  const { data } = await getSupabaseAdmin()
    .from("messages")
    .select("id, created_at, subject, body, answered, reply_body, recipient, link")
    .eq("id", id)
    .maybeSingle()
  return data as Omit<MessageRow, "role" | "email"> | null
}

export async function getMessagesFromDb(recipient?: MessageRecipient): Promise<DbMessage[]> {
  let query = getSupabaseAdmin().from("messages").select("*").order("created_at", { ascending: false })
  if (recipient) query = query.eq("recipient", recipient)

  const { data, error } = await query
  if (error) {
    console.error("Błąd pobierania wiadomości:", error.message)
    return []
  }

  return (data as MessageRow[]).map((row) => ({
    id: row.id,
    subject: row.subject,
    role: row.role,
    recipient: row.recipient ?? "rops",
    link: row.link,
    body: row.body,
    date: new Date(row.created_at).toLocaleString("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Warsaw",
    }),
    answered: row.answered,
    replyBody: row.reply_body || undefined,
    hasEmail: Boolean(row.email),
  }))
}

// Błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export type ReplyState = { ok: true; emailSent: boolean } | { ok: false; error: string }

// Adres e-mail czyta tylko serwer: przeglądarka wysyła id wiadomości i treść odpowiedzi.
export async function replyToMessageAction(id: string, reply: string): Promise<ReplyState> {
  const text = reply.trim()
  if (!text) return { ok: false, error: "Wpisz treść odpowiedzi." }

  const { data: message, error } = await getSupabaseAdmin()
    .from("messages")
    .update({ answered: true, reply_body: text })
    .eq("id", id)
    .select("subject, email, recipient")
    .single()
  if (error || !message) {
    console.error("Zapis odpowiedzi:", error)
    return { ok: false, error: "Nie udało się zapisać odpowiedzi. Spróbuj ponownie." }
  }

  const emailSent = message.email
    ? await sendEmail(
        message.email,
        `Odpowiedź od ${fromLabel(message.recipient)}: ${message.subject}`,
        `${text}\n\nTwoje pytanie i odpowiedź: ${siteUrl(`/wiadomosci/${id}`)}`
      )
    : false

  revalidatePath("/panel")
  revalidatePath("/mentor")
  revalidatePath(`/wiadomosci/${id}`)
  return { ok: true, emailSent }
}

/** Ile spraw czeka na daną rolę — licznik przy linku w menu. */
export async function getInboxCount(role: Role): Promise<number> {
  const supabase = getSupabaseAdmin()
  const count = async (query: PromiseLike<{ count: number | null }>) => (await query).count ?? 0
  const unanswered = (recipient?: MessageRecipient) => {
    const query = supabase.from("messages").select("id", { count: "exact", head: true }).eq("answered", false)
    return recipient ? query.eq("recipient", recipient) : query
  }

  if (role === "expert") return count(unanswered("mentor"))
  if (role !== "admin") return 0

  const counts = await Promise.all([
    count(unanswered()),
    count(supabase.from("needs").select("id", { count: "exact", head: true }).eq("status", "Nowe")),
    count(
      supabase
        .from("solutions")
        .select("id", { count: "exact", head: true })
        .in("status", ["draft", "pending", "oczekuje"])
    ),
  ])
  return counts.reduce((sum, n) => sum + n, 0)
}
