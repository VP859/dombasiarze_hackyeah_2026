"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseAdmin } from "@/lib/supabase"
import type { DraftInnovation } from "../panel/preview-sheet"

export async function getDraftSolutions(): Promise<DraftInnovation[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("solutions")
    .select(
      `
      id,
      title,
      problem,
      method,
      effect,
      resources,
      audience,
      stage,
      status,
      organizations (
        name
      )
    `
    )
    .in("status", ["draft", "pending", "oczekuje"])

  if (error) {
    console.error("Błąd pobierania rozwiązań do weryfikacji:", error.message)
    return []
  }
  
  return (data || []).map((item) => {
    const typedItem = item as {
      id: string
      title: string
      organizations?: { name?: string | null } | null
      stage?: string | null
      audience?: string | null
      problem?: string | null
      method?: string | null
      effect?: string | null
      resources?: string | null
    }

    return {
      id: typedItem.id,
      title: typedItem.title,
      organization:
        typedItem.organizations?.name || "Zgłoszenie indywidualne / NGO",
      stage: (typedItem.stage || "pomysł") as DraftInnovation["stage"],
      source: "Zgłoś rozwiązanie",
      date: new Date().toISOString().split("T")[0],
      audience: typedItem.audience || "Wszyscy mieszkańcy",
      problem: typedItem.problem || "Brak opisu problemu",
      method: typedItem.method || "Brak opisu metody",
      effects: typedItem.effect
        ? typedItem.effect.split("\n").filter(Boolean)
        : ["Brak podanych efektów"],
      resources: typedItem.resources
        ? typedItem.resources
            .split(",")
            .map((r: string) => r.trim())
            .filter(Boolean)
        : ["Brak wymogów"],
    }
  })
}

export async function approveSolutionAction(id: string) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from("solutions")
    .update({ status: "published" })
    .eq("id", id)

  if (error) {
    console.error("Błąd podczas zatwierdzania innowacji:", error.message)
    throw new Error(`Nie udało się zatwierdzić innowacji: ${error.message}`)
  }

  revalidatePath("/panel")
}

// Błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export type ReplyState = { ok: true } | { ok: false; error: string }

// Adres e-mail czyta tylko serwer: przeglądarka wysyła id wiadomości i treść odpowiedzi.
export async function replyToMessageAction(id: string, reply: string): Promise<ReplyState> {
  const text = reply.trim()
  if (!text) return { ok: false, error: "Wpisz treść odpowiedzi." }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: "Wysyłka e-maili nie jest skonfigurowana (brak RESEND_API_KEY)." }

  const supabaseAdmin = getSupabaseAdmin()
  const { data: message, error } = await supabaseAdmin
    .from("messages")
    .select("subject, email")
    .eq("id", id)
    .single()

  if (error || !message) {
    console.error("Błąd pobierania wiadomości:", error)
    return { ok: false, error: "Nie znaleziono wiadomości." }
  }
  if (!message.email) return { ok: false, error: "Autor tej wiadomości nie podał adresu e-mail." }

  // Resend przez REST — bez dodatkowej paczki. Bez własnej domeny działa tylko nadawca onboarding@resend.dev.
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "Podaj Dalej <onboarding@resend.dev>",
      to: [message.email],
      subject: `Re: ${message.subject}`,
      text: `${text}\n\n—\nMałopolski Hub Innowacji Społecznych · ROPS Kraków`,
    }),
  })
  if (!res.ok) {
    console.error("Błąd wysyłki e-maila:", res.status, await res.text())
    return { ok: false, error: "Nie udało się wysłać e-maila. Spróbuj ponownie za chwilę." }
  }

  const { error: updateError } = await supabaseAdmin.from("messages").update({ answered: true }).eq("id", id)
  if (updateError) console.error("Błąd oznaczania wiadomości:", updateError)

  revalidatePath("/panel")
  return { ok: true }
}

export async function createCallAction(title: string, deadline: string) {
  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from("calls")
    .insert({
      title,
      deadline,
      applications: 0,
      open: true,
    })

  if (error) {
    throw new Error(`Błąd tworzenia naboru: ${error.message}`)
  }

  revalidatePath("/panel")
  return { success: true }
}
