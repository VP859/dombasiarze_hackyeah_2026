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

export type ApplicationDb = {
  id: string
  ideaTitle: string
  authorEmail: string
  createdAt: string
  content: unknown
}

const FALLBACK_CALL_ID = "11111111-1111-1111-1111-111111111111"

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

  // Znajdujemy domyślny główny nabór (np. Małopolskie Innowacje Społeczne)
  const defaultCall = callsData?.find((c) => c.open) || callsData?.[0]
  const defaultCallId = defaultCall?.id

  const countMap: Record<string, number> = {}

  if (appsData) {
    for (const app of appsData) {
      let targetCallId = app.call_id

      if (
        (!targetCallId || targetCallId === FALLBACK_CALL_ID) &&
        defaultCallId
      ) {
        targetCallId = defaultCallId
      }

      if (targetCallId) {
        countMap[targetCallId] = (countMap[targetCallId] || 0) + 1
      }
    }
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

  const { data: allApps, error: appsError } = await supabase
    .from("applications")
    .select("id, created_at, content, idea_id, call_id")
    .order("created_at", { ascending: false })

  if (appsError || !allApps) {
    console.error("Błąd pobierania wniosków:", appsError?.message)
    return []
  }

  type ApplicationRow = {
    id: string
    created_at: string | null
    content: unknown
    idea_id: string | null
    call_id: string | null
  }

  const { data: firstCall } = await supabase
    .from("calls")
    .select("id")
    .limit(1)
    .maybeSingle()
  const mainCallId = firstCall?.id

  const appsForThisCall = (allApps as ApplicationRow[]).filter((app) => {
    if (app.call_id === callId) return true
    if (
      (app.call_id === FALLBACK_CALL_ID || !app.call_id) &&
      callId === mainCallId
    )
      return true
    return false
  })

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
      createdAt: row.created_at
        ? new Date(row.created_at).toLocaleDateString("pl-PL")
        : "",
      content,
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
