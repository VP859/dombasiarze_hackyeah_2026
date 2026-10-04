"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseAdmin } from "@/lib/supabase"

export type CallDb = {
  id: string
  title: string
  deadline: string
  applicationsCount: number
  open: boolean
}

export type ApplicationStatus = "submitted" | "approved" | "rejected"

export type ApplicationDb = {
  id: string
  ideaTitle: string
  authorEmail: string
  content: unknown
  /** null = w tabeli applications nie ma jeszcze kolumny status */
  status: ApplicationStatus | null
}

export async function getCallsFromDb(): Promise<CallDb[]> {
  const supabase = getSupabaseAdmin()

  const { data: callsData, error: callsError } = await supabase
    .from("calls")
    .select("id, title, deadline, open, created_at")
    .order("created_at", { ascending: false })

  if (callsError) {
    console.error("Błąd pobierania naborów:", callsError.message)
    return []
  }

  const { data: appsData } = await supabase
    .from("applications")
    .select("id, call_id")

  const countMap: Record<string, number> = {}
  for (const app of appsData ?? []) {
    if (app.call_id) countMap[app.call_id] = (countMap[app.call_id] || 0) + 1
  }

  return (callsData || []).map(
    (row: {
      id: string
      title: string | null
      deadline: string | null
      open: boolean | null
    }) => ({
      id: row.id,
      title: row.title || "Nabór bez tytułu",
      deadline: row.deadline
        ? row.deadline.split("T")[0]
        : new Date().toISOString().split("T")[0],
      open: Boolean(row.open),
      applicationsCount: countMap[row.id] || 0,
    })
  )
}

export async function getApplicationsForCall(
  callId: string
): Promise<ApplicationDb[]> {
  const supabase = getSupabaseAdmin()

  // Tabela applications nie ma kolumny created_at — wybieramy tylko istniejące kolumny.
  const query = (columns: string) => supabase.from("applications").select(columns).eq("call_id", callId)
  let { data, error: appsError } = await query("id, content, idea_id, status")
  // Bez kolumny status (SQL jeszcze nie uruchomiony) wnioski i tak się wyświetlają, tylko bez statusu.
  if (appsError?.code === "42703") ({ data, error: appsError } = await query("id, content, idea_id"))

  if (appsError) {
    console.error("Błąd pobierania wniosków:", appsError.message)
    return []
  }

  const appsForThisCall = (data ?? []) as unknown as {
    id: string
    content: unknown
    idea_id: string | null
    status?: ApplicationStatus
  }[]
  if (appsForThisCall.length === 0) {
    return []
  }

  // 2. Pobieramy dane autorów z tabeli ideas
  const ideaIds = Array.from(
    new Set(
      appsForThisCall
        .map((app) => app.idea_id)
        .filter((id): id is string => Boolean(id))
    )
  )
  const ideasMap: Record<
    string,
    { title: string | null; author_email: string | null }
  > = {}

  if (ideaIds.length > 0) {
    const { data: ideasData } = await supabase
      .from("ideas")
      .select("id, title, author_email")
      .in("id", ideaIds)

    if (ideasData) {
      for (const idea of ideasData) {
        ideasMap[idea.id] = {
          title: idea.title,
          author_email: idea.author_email,
        }
      }
    }
  }

  // 3. Mapowanie wniosków z obsługą różnych formatów JSON
  return appsForThisCall.map((row) => {
    const idea = row.idea_id ? ideasMap[row.idea_id] : undefined
    let parsedContent = row.content

    if (typeof parsedContent === "string") {
      try {
        parsedContent = JSON.parse(parsedContent)
      } catch {
        parsedContent = {}
      }
    }

    const content =
      typeof parsedContent === "object" && parsedContent !== null
        ? (parsedContent as Record<string, unknown>)
        : {}

    return {
      id: row.id,
      ideaTitle:
        typeof content.project_title === "string"
          ? content.project_title
          : idea?.title || "Wniosek Grantowy",
      authorEmail: idea?.author_email || "Brak danych autora",
      content,
      status: row.status ?? null,
    }
  })
}

export async function createCallAction(input: {
  title: string
  deadline: string
}) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from("calls").insert({
    title: input.title,
    deadline: input.deadline,
    open: true,
  })

  if (error) {
    throw new Error(`Nie udało się utworzyć naboru: ${error.message}`)
  }

  revalidatePath("/panel")
}

export async function toggleCallStatusAction(
  callId: string,
  currentOpen: boolean
) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from("calls")
    .update({ open: !currentOpen })
    .eq("id", callId)

  if (error) {
    throw new Error(`Nie udało się zmienić statusu: ${error.message}`)
  }

  revalidatePath("/panel")
}

const STATUSES: ApplicationStatus[] = ["submitted", "approved", "rejected"]

// Błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export async function setApplicationStatusAction(
  id: string,
  status: ApplicationStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!STATUSES.includes(status)) return { ok: false, error: "Nieznany status wniosku." }

  const { error } = await getSupabaseAdmin().from("applications").update({ status }).eq("id", id)

  if (error) {
    console.error("Błąd zmiany statusu wniosku:", error.message)
    return {
      ok: false,
      error:
        error.code === "42703" || error.code === "PGRST204"
          ? "W bazie brakuje kolumny status w tabeli applications."
          : "Nie udało się zapisać decyzji. Spróbuj ponownie.",
    }
  }

  revalidatePath("/panel")
  return { ok: true }
}
