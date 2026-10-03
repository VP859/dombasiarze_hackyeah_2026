"use server"

import { GoogleGenAI, Type } from "@google/genai"
import { getSolutionById } from "@/app/actions/solutions"

export interface AdaptationResult {
  summary: string
  local_barriers: string[]
  action_plan: string[]
  estimated_budget_notes: string
  kpis: string[]
}

export interface GminaContext {
  gminaName: string
  population: string
  type: string
  budgetConstraint: string
  specificChallenges: string
}

// Stan formularza dla useActionState: błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export type AdaptState = { input: GminaContext; result?: AdaptationResult; error?: string } | null

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    local_barriers: { type: Type.ARRAY, items: { type: Type.STRING } },
    action_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
    estimated_budget_notes: { type: Type.STRING },
    kpis: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "local_barriers", "action_plan", "estimated_budget_notes", "kpis"],
}

export async function adaptInnovationForGmina(
  solutionId: string,
  gminaContext: GminaContext
): Promise<AdaptationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("Asystent nie jest skonfigurowany: brakuje klucza Gemini.")
  }

  const solution = await getSolutionById(solutionId)
  if (!solution) {
    throw new Error("Innowacja nie została znaleziona.")
  }

  const prompt = `
Jesteś doradcą ds. innowacji społecznych w samorządach terytorialnych w Polsce.
Przeanalizuj poniższą innowację społeczną i opracuj dedykowany plan jej wdrożenia (dostosowania) dla podanej gminy.
Pisz po polsku, prostym językiem, krótkimi zdaniami.

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
- Specyficzne wyzwania/uwarunkowania lokalne: ${gminaContext.specificChallenges || "Brak danych"}

---
ZADANIE:
- summary: krótkie podsumowanie, jak innowacja wpisuje się w potrzeby tej gminy,
- local_barriers: 3–5 możliwych barier lokalnych,
- action_plan: 4–6 kroków wdrożenia (przygotowanie, pilotaż, wdrożenie, ewaluacja), bez numeracji,
- estimated_budget_notes: rekomendacje budżetowe i źródła finansowania,
- kpis: 2–4 mierzalne wskaźniki sukcesu.
`

  try {
    const ai = new GoogleGenAI({ apiKey })
    // Model tekstowy (wcześniej był tu model embeddingów, który nie generuje tekstu).
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    })

    if (!response.text) {
      throw new Error("Pusta odpowiedź modelu.")
    }
    return JSON.parse(response.text) as AdaptationResult
  } catch (error) {
    console.error("Błąd generowania adaptacji przez Gemini API:", error)
    throw new Error("Nie udało się przygotować planu. Spróbuj ponownie za chwilę.")
  }
}

export async function adaptInnovationAction(_prev: AdaptState, formData: FormData): Promise<AdaptState> {
  const field = (name: string) => String(formData.get(name) ?? "").trim()
  const input: GminaContext = {
    gminaName: field("gminaName"),
    population: field("population"),
    type: field("type"),
    budgetConstraint: field("budgetConstraint"),
    specificChallenges: field("specificChallenges"),
  }

  if (!input.gminaName || !input.population || !input.budgetConstraint) {
    return { input, error: "Uzupełnij nazwę gminy, liczbę mieszkańców i możliwości budżetowe." }
  }

  try {
    return { input, result: await adaptInnovationForGmina(field("solutionId"), input) }
  } catch (error) {
    return { input, error: error instanceof Error ? error.message : "Nie udało się przygotować planu." }
  }
}
