"use server"

import { GoogleGenAI, Type } from "@google/genai"
import { MatchmakingAnalysis } from "@/types/matchmaking"

function createAiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("Brak zmiennej środowiskowej GEMINI_API_KEY")
  }

  return new GoogleGenAI({ apiKey })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = createAiClient()
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  })
  const embeddingValues = response.embeddings?.[0]?.values

  if (!Array.isArray(embeddingValues)) {
    throw new Error("Nie udało się wygenerować wektora embedding.")
  }

  return embeddingValues
}

export async function analyzeNeed(
  description: string,
  gmina: string
): Promise<MatchmakingAnalysis> {
  const ai = createAiClient()
  const prompt = `Przeanalizuj poniższe zgłoszenie potrzeby społecznej z gminy ${gmina} i wyciągnij kluczowe wnioski:

Opis zgłoszenia:
"${description}"`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction:
        "Jesteś ekspertem ds. innowacji społecznych w Małopolskim Hubie Innowacji Społecznych. Analizujesz zgłoszenia mieszkańców i samorządów. Odpowiadaj wyłącznie w formacie JSON zgodnym z narzuconym schematem.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description:
              "Główna kategoria problemu (np. Wykluczenie cyfrowe, Seniorzy, Ekologia, Edukacja, Młodzież)",
          },
          key_challenges: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista 2-4 kluczowych wyzwań wyodrębnionych z opisu",
          },
          suggested_action: {
            type: Type.STRING,
            description:
              "Krótka rekomendacja dotycząca dalszych kroków lub typu innowacji",
          },
          confidence_score: {
            type: Type.NUMBER,
            description: "Poziom pewności analizy od 0.0 do 1.0",
          },
        },
        required: [
          "category",
          "key_challenges",
          "suggested_action",
          "confidence_score",
        ],
      },
    },
  })

  if (!response.text) {
    throw new Error("Brak odpowiedzi z modelu Gemini API.")
  }

  return JSON.parse(response.text) as MatchmakingAnalysis
}

export interface CanvasData {
  problem_definition: string
  target_group_needs: string
  innovative_aspect: string
  expected_outcomes: string
  potential_risks: string
}

export async function generateRopsCanvas(
  title: string,
  essence: string,
  audience: string
): Promise<CanvasData> {
  const ai = createAiClient()
  const prompt = `Przekształć poniższy pomysł w ustrukturyzowaną Canwę Innowacji ROPS:

Tytuł: ${title}
Istota pomysłu: ${essence}
Grupa docelowa: ${audience || 'Nieokreślona dokładnie'}`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction:
        "Jesteś ekspertem ds. innowacji społecznych w Małopolskim Hubie Innowacji Społecznych. Tworzysz ustrukturyzowane Canwy Innowacji wg metodologii ROPS. Odpowiadaj wyłącznie w formacie JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problem_definition: {
            type: Type.STRING,
            description: "Precyzyjna definicja problemu społecznego",
          },
          target_group_needs: {
            type: Type.STRING,
            description: "Analiza potrzeb odbiorców i beneficjentów",
          },
          innovative_aspect: {
            type: Type.STRING,
            description: "Co stanowi o nowatorstwie tego rozwiązania",
          },
          expected_outcomes: {
            type: Type.STRING,
            description: "Mierzalne rezultaty i zmiana społeczna",
          },
          potential_risks: {
            type: Type.STRING,
            description: "Kluczowe ryzyka i sposoby ich łagodzenia",
          },
        },
        required: [
          "problem_definition",
          "target_group_needs",
          "innovative_aspect",
          "expected_outcomes",
          "potential_risks",
        ],
      },
    },
  })

  if (!response.text) {
    throw new Error("Brak odpowiedzi z modelu Gemini API.")
  }

  return JSON.parse(response.text) as CanvasData
}

export interface GrantApplicationContent {
  project_title: string
  executive_summary: string
  problem_alignment: string
  detailed_schedule: string[]
  budget_breakdown: { item: string; estimated_cost_pln: number }[]
  sustainability_plan: string
}

export async function generateGrantApplicationContent(
  idea: { title: string; essence: string; audience: string; canvas: unknown },
  call: { title: string; rules: string }
): Promise<GrantApplicationContent> {
  const ai = createAiClient()
  const prompt = `Przygotuj kompletny szkic wniosku grantowego dopasowany do Regulaminu Naboru.

DANE POMYSŁU:
- Tytuł: ${idea.title}
- Istota: ${idea.essence}
- Grupa docelowa: ${idea.audience}
- Canwa Innowacji ROPS: ${JSON.stringify(idea.canvas)}

REGULAMIN NABORU:
- Tytuł naboru: ${call.title}
- Zasady/Regulamin: ${call.rules}`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction:
        "Jesteś doradcą ds. pozyskiwania funduszy w Małopolskim Hubie Innowacji Społecznych. Generujesz szkice wniosków grantowych na podstawie regulaminów naborów. Odpowiadaj wyłącznie w formacie JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          project_title: { type: Type.STRING },
          executive_summary: {
            type: Type.STRING,
            description: "Streszczenie wniosku dla komisji",
          },
          problem_alignment: {
            type: Type.STRING,
            description: "Uzasadnienie zgodności z regulaminem naboru",
          },
          detailed_schedule: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Harmonogram kamieni milowych pilotażu",
          },
          budget_breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING, description: 'Kategoria wydatku' },
                estimated_cost_pln: { type: Type.NUMBER, description: 'Szacowany koszt w PLN' },
              },
              required: ['item', 'estimated_cost_pln'],
            },
            description: 'Szacunkowy kosztorys działania',
          },
          sustainability_plan: {
            type: Type.STRING,
            description: "Plan trwałości i skalowalności po zakończeniu grantu",
          },
        },
        required: [
          "project_title",
          "executive_summary",
          "problem_alignment",
          "detailed_schedule",
          "budget_breakdown",
          "sustainability_plan",
        ],
      },
    },
  })

  if (!response.text) {
    throw new Error("Brak odpowiedzi z modelu Gemini API.")
  }

  return JSON.parse(response.text) as GrantApplicationContent
}