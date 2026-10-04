"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseAdmin } from "@/lib/supabase"
import type { Need, NeedStatus } from "../panel/needs-panel"

export async function getNeedsFromDb(): Promise<Need[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("needs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Błąd pobierania zgłoszeń potrzeb:", error.message)
    return []
  }

  return (data || []).map((row: unknown) => {
    const typedRow = row as {
      id: string
      gmina?: string | null
      description?: string | null
      text?: string | null
      author_role?: string | null
      role?: string | null
      challenge_ids?: string[] | null
      audiences?: string[] | null
      status?: NeedStatus | null
      created_at?: string | null
      author_email?: string | null
      email?: string | null
    }

    const role: Need["role"] =
      typedRow.author_role === "ngo" || typedRow.role === "ngo"
        ? "ngo"
        : typedRow.author_role === "official" || typedRow.role === "official"
          ? "official"
          : "resident"

    return {
      id: typedRow.id,
      gmina: typedRow.gmina || "Nieokreślona",
      text: typedRow.description || typedRow.text || "",
      role,
      challenges: Array.isArray(typedRow.challenge_ids)
        ? typedRow.challenge_ids
        : [],
      audiences: Array.isArray(typedRow.audiences) ? typedRow.audiences : [],
      status: (typedRow.status as NeedStatus) || "Nowe",
      matches: 0,
      date: typedRow.created_at
        ? typedRow.created_at.split("T")[0]
        : new Date().toISOString().split("T")[0],
      email: typedRow.author_email || typedRow.email || "",
    }
  })
}

export async function updateNeedStatusAction(id: string, status: NeedStatus) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from("needs").update({ status }).eq("id", id)

  if (error) {
    console.error("Błąd aktualizacji statusu w tabeli needs:", error.message)
    throw new Error(`Nie udało się zmienić statusu: ${error.message}`)
  }

  revalidatePath("/panel")
}
