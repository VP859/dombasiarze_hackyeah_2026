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
    model: 'gemini-embedding-001',
    contents: text,
    config: {
      outputDimensionality: 768, 
    },
  });

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

export async function transcribeAudio(audio: Blob): Promise<string> {
  const ai = createAiClient()
  const data = Buffer.from(await audio.arrayBuffer()).toString("base64")
  const mimeType = audio.type.split(";")[0] || "audio/webm"

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: [
      {
        inlineData: {
          data,
          mimeType,
        },
      },
      {
        text: "Rozpoznaj całą wypowiedź. Zapisz po polsku wszystko, co da się usłyszeć: wypowiedzi w innych językach wiernie przetłumacz na naturalny język polski, a polskie wypowiedzi transkrybuj bez zmiany ich znaczenia. Zachowaj imiona, nazwy własne i liczby, dodaj poprawną interpunkcję. Nie zgaduj niezrozumiałych fragmentów. Zwróć wyłącznie polski tekst, bez komentarzy, etykiet i opisów. Jeśli nie słychać mowy, zwróć pusty tekst.",
      },
    ],
    config: {
      temperature: 0,
      systemInstruction:
        "Jesteś dokładnym transkrybentem i tłumaczem. Priorytetem jest zgodność ze słyszaną treścią. Wynik zawsze musi być po polsku.",
    },
  })

  return response.text?.trim() ?? ""
}
