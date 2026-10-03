import { GoogleGenAI, Type } from "@google/genai"
import { MatchmakingAnalysis } from "@/types/matchmaking"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Brak zmiennej środowiskowej GEMINI_API_KEY")
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001', 
    contents: text,
  });

  const values = response.embeddings?.[0]?.values;
  if (!values) {
    throw new Error('Nie udało się wygenerować wektora embedding.');
  }

  return values;
}


export async function analyzeNeed(
  description: string,
  gmina: string
): Promise<MatchmakingAnalysis> {
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
