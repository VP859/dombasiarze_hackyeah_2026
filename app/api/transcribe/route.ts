import { transcribeAudio } from "@/lib/ai"

export const runtime = "nodejs"

const MAX_AUDIO_SIZE = 20 * 1024 * 1024

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Transkrypcja nie jest skonfigurowana: brakuje klucza Gemini." },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const audio = formData.get("audio")

    if (!(audio instanceof File) || !audio.type.startsWith("audio/")) {
      return Response.json(
        { error: "Nie znaleziono prawidłowego pliku audio." },
        { status: 400 }
      )
    }

    if (audio.size > MAX_AUDIO_SIZE) {
      return Response.json(
        { error: "Nagranie jest zbyt duże do transkrypcji." },
        { status: 413 }
      )
    }

    const transcript = await transcribeAudio(audio)
    return Response.json({ transcript })
  } catch (error) {
    console.error("Transcription error:", error)
    return Response.json(
      { error: "Nie udało się przygotować transkrypcji nagrania." },
      { status: 500 }
    )
  }
}