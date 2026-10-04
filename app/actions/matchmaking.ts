"use server"

import { after } from "next/server"

import { needSchema } from "@/lib/schemas"
import { notifyRops, sendEmail, siteUrl } from "@/lib/email"
import { generateEmbedding, analyzeNeed } from "@/lib/ai"
import { getSupabaseAdmin } from "@/lib/supabase"
import {
  MIN_SIMILARITY,
  MIN_NEED_SIMILARITY,
  type MatchmakingResult,
  type SolutionMatch,
  type NeedMatch,
} from "@/types/matchmaking"

export async function processNeedAction(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; data?: MatchmakingResult; error?: string }> {
  const parsed = needSchema.safeParse({
    description: formData.get("description"),
    gmina: formData.get("gmina") || "Nieokreślona",
    author_email: formData.get("author_email"),
    author_role: formData.get("author_role") || "resident",
    challenges: formData.getAll("challenge"),
    audiences: formData.getAll("audience"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }
  const need = parsed.data

  try {
    const supabase = getSupabaseAdmin()
    const q = JSON.stringify(await generateEmbedding(need.description))

    // Szukamy przed zapisem, więc zgłoszenie nie dopasuje się samo do siebie.
    // Analiza AI to dodatek: gdy model nie odpowie, zgłoszenie i dopasowania i tak się zapisują.
    const [solutionsRes, needsRes, analysis] = await Promise.all([
      supabase.rpc("match_solutions", { q, k: 5 }),
      supabase.rpc("match_needs", { q, k: 3 }),
      analyzeNeed(need.description, need.gmina).catch((err) => {
        console.error("Analiza AI zgłoszenia nie powiodła się:", err)
        return null
      }),
    ])
    if (solutionsRes.error) console.error("RPC match_solutions:", solutionsRes.error)
    if (needsRes.error) console.error("RPC match_needs:", needsRes.error)

    const matchedSolutions = ((solutionsRes.data ?? []) as SolutionMatch[]).filter(
      (s) => s.similarity >= MIN_SIMILARITY
    )
    const matchedNeeds = ((needsRes.data ?? []) as NeedMatch[]).filter(
      (n) => n.similarity >= MIN_NEED_SIMILARITY
    )

    const { data: row, error } = await supabase
      .from("needs")
      .insert({
        text: need.description,
        gmina: need.gmina,
        email: need.author_email,
        role: need.author_role,
        challenges: need.challenges,
        audiences: need.audiences,
        matches: matchedSolutions.length,
        embedding: q,
        status: "Nowe",
      })
      .select("id")
      .single()

    if (error || !row) {
      console.error("Zapis zgłoszenia:", error)
      return { success: false, error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę." }
    }

    // Po odpowiedzi do przeglądarki: autor dostaje dopasowania (tylko za zgodą), ROPS — powiadomienie.
    const consent = formData.get("consent") === "on"
    const list = matchedSolutions.map((s) => `• ${s.title}: ${siteUrl(`/innowacja/${s.id}`)}`).join("\n")
    after(() =>
      Promise.all([
        consent &&
          sendEmail(
            need.author_email,
            "Twoje zgłoszenie trafiło do ROPS Kraków",
            (list
              ? `Te innowacje rozwiązały podobny problem w innych gminach:\n\n${list}`
              : "Nie znaleźliśmy jeszcze gotowej innowacji dla Twojego problemu.") +
              "\n\nPracownicy ROPS przejrzą zgłoszenie i odpowiedzą na ten adres."
          ),
        notifyRops(
          `Nowe zgłoszenie: ${need.gmina}`,
          `${need.description}\n\nDopasowane innowacje: ${matchedSolutions.length}`
        ),
      ])
    )

    return {
      success: true,
      data: { needId: row.id, description: need.description, analysis, matchedSolutions, matchedNeeds },
    }
  } catch (err) {
    console.error("Matchmaking:", err)
    return {
      success: false,
      error: "Nie udało się przeanalizować zgłoszenia. Spróbuj ponownie za chwilę.",
    }
  }
}
