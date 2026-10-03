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
