"use server"

import { GoogleGenAI } from "@google/genai"
import { getSolutionById } from "@/app/actions/solutions"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export interface AdaptationResult {
  summary: string
  local_barriers: string[]
  action_plan: string[]
  estimated_budget_notes: string
  kpis: string[]
}

export async function adaptInnovationForGmina(
  solutionId: string,
  gminaContext: {
    gminaName: string
    population: string
    type: string
    budgetConstraint: string
    specificChallenges: string
  }
): Promise<AdaptationResult> {
  const solution = await getSolutionById(solutionId)
  if (!solution) {
    throw new Error("Innowacja nie została znaleziona.")
  }

  const prompt = `
Jesteś doradcą ds. innowacji społecznych w samorządach terytorialnych w Polsce.
Przeanalizuj poniższą innowację społeczną i opracuj dedykowany plan jej wdrożenia (dostosowania) dla podanej gminy.

---
DANE INNOWACJI:
- Tytuł: ${solution.title}
- Problem: ${solution.problem}
- Metoda / Sposób działania: ${solution.method}
- Oczekiwany efekt: ${solution.effect || "Brak danych"}
- Wymagane zasoby: ${solution.resources || "Brak danych"}
- Grupa docelowa: ${solution.audience || "Brak danych"}

---
DANE GMINY:
- Nazwa gminy: ${gminaContext.gminaName}
- Typ gminy: ${gminaContext.type}
- Liczba mieszkańców: ${gminaContext.population}
- Ograniczenia budżetowe/finansowe: ${gminaContext.budgetConstraint}
- Specyficzne wyzwania/uwarunkowania lokalne: ${gminaContext.specificChallenges}

---
ZADANIE:
Zwróć odpowiedź WYŁĄCZNIE w formacie czystego JSON (bez podawania znaczników markdown \`\`\`json), zgodną ze strukturą:
{
  "summary": "Krótkie podsumowanie jak innowacja wpisuje się w potrzeby tej konkretnej gminy.",
  "local_barriers": ["Bariera 1", "Bariera 2", "Bariera 3"],
  "action_plan": ["Krok 1 (Przygotowanie)", "Krok 2 (Pilotaż)", "Krok 3 (Wdrożenie)", "Krok 4 (Ewaluacja)"],
  "estimated_budget_notes": "Rekomendacje budżetowe i potencjalne źródła finansowania dla tej gminy.",
  "kpis": ["Wskaźnik sukcesu 1", "Wskaźnik sukcesu 2"]
}
`

  try {
    const response = await ai.models.generateContent({
      model: "gemini-embedding-001",
      contents: prompt,
    })

    const rawText = response.text || ""
    // Clean the response text to ensure it's valid JSON
    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    return JSON.parse(cleanedText) as AdaptationResult
  } catch (error) {
    console.error("Błąd generowania adaptacji przez Gemini API:", error)
    throw new Error("Nie udało się wygenerować planu dostosowania innowacji.")
  }
}
