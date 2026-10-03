"use client"

import React, { useState } from "react"
import { generateRopsCanvas, CanvasData } from "@/lib/ai"

// Local fallback types for the deduplication and save actions until the server modules are available.
type SimilarSolution = {
  id: string
  title: string
  similarity: number
}

type SaveIdeaPayload = {
  title: string
  essence: string
  audience: string
  stage: "pomysł" | "pilotaż" | "sprawdzona"
  canvas: CanvasData | null
  authorEmail: string
}

async function checkIdeaDuplicates(
  _title: string,
  _essence: string
): Promise<{ score: number; similarSolutions: SimilarSolution[] }> {
  return { score: 0, similarSolutions: [] }
}

async function saveIdeaAction(
  _payload: SaveIdeaPayload
): Promise<{ id: string }> {
  return { id: "local-demo-idea-id" }
}

import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
  Save,
} from "lucide-react"

export function IdeaWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  // Stan Formularza
  const [title, setTitle] = useState("")
  const [essence, setEssence] = useState("")
  const [audience, setAudience] = useState("")
  const [stage, setStage] = useState<"pomysł" | "pilotaż" | "sprawdzona">(
    "pomysł"
  )
  const [authorEmail, setAuthorEmail] = useState("")

  // Wyniki AI
  const [duplicateCheck, setDuplicateCheck] = useState<{
    score: number
    similarSolutions: SimilarSolution[]
  } | null>(null)
  const [canvas, setCanvas] = useState<CanvasData | null>(null)
  const [savedIdeaId, setSavedIdeaId] = useState<string | null>(null)

  const handleAnalyzeAndBuildCanvas = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const [dupResult, ropsCanvas] = await Promise.all([
        checkIdeaDuplicates(title, essence),
        generateRopsCanvas(title, essence, audience),
      ])

      setDuplicateCheck({
        score: dupResult.score,
        similarSolutions: dupResult.similarSolutions,
      })
      setCanvas(ropsCanvas)
      setStep(2)
    } catch (err) {
      alert("Wystąpił błąd podczas analizy AI. Spróbuj ponownie.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveIdea = async () => {
    setLoading(true)

    try {
      const data = await saveIdeaAction({
        title,
        essence,
        audience,
        stage,
        canvas,
        authorEmail,
      })

      setSavedIdeaId(data.id)
      setStep(3)
    } catch (err: unknown) {
      alert("Błąd zapisu do bazy danych: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-8 border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Kreator Pomysłów Innowacji Społecznych
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Małopolski Hub Innowacji Społecznych – Fiszka, Weryfikacja & Canwa
          ROPS
        </p>

        <div
          className="mt-6 flex items-center gap-4"
          role="navigation"
          aria-label="Kroki formularza"
        >
          <span
            className={`text-sm font-medium ${step === 1 ? "font-bold text-blue-600" : "text-slate-400"}`}
          >
            1. Fiszka & Analiza
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={`text-sm font-medium ${step === 2 ? "font-bold text-blue-600" : "text-slate-400"}`}
          >
            2. Canwa ROPS & Duble
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={`text-sm font-medium ${step === 3 ? "font-bold text-blue-600" : "text-slate-400"}`}
          >
            3. Podsumowanie
          </span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleAnalyzeAndBuildCanvas} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Tytuł pomysłu <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Cyfrowy Asystent Seniora w gminie"
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label
              htmlFor="essence"
              className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Istota pomysłu (Co chcesz zmienić/stworzyć?){" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="essence"
              required
              rows={4}
              value={essence}
              onChange={(e) => setEssence(e.target.value)}
              placeholder="Opisz na czym polega rozwiązanie..."
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="audience"
                className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Komu dedykowane jest rozwiązanie?
              </label>
              <input
                id="audience"
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="np. Osoby 70+ z terenów wiejskich"
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label
                htmlFor="stage"
                className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Etap dojrzałości
              </label>
              <select
                id="stage"
                value={stage}
                onChange={(e) =>
                  setStage(
                    e.target.value as "pomysł" | "pilotaż" | "sprawdzona"
                  )
                }
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="pomysł">Wstępny pomysł</option>
                <option value="pilotaż">Gotowy do pilotażu</option>
                <option value="sprawdzona">Sprawdzona innowacja</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              E-mail autora
            </label>
            <input
              id="email"
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="autor@innowacje.pl"
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analizowanie przez Gemini API...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generuj Canwę & Sprawdź Duble
              </>
            )}
          </button>
        </form>
      )}

      {step === 2 && canvas && (
        <div className="space-y-8">
          <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              Wynik analizy deduplikacji
            </h2>
            {duplicateCheck && duplicateCheck.similarSolutions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-medium text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  Znaleziono podobne rozwiązania w bazie:
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {duplicateCheck.similarSolutions.map((sol) => (
                    <li key={sol.id}>
                      <strong>{sol.title}</strong> – Podobieństwo:{" "}
                      {(sol.similarity * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-medium text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Brak wykrytych duplikatów. Pomysł jest unikalny!
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Wygenerowana Canwa Innowacji ROPS
            </h2>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                1. Definicja Problemu
              </label>
              <textarea
                rows={3}
                value={canvas.problem_definition}
                onChange={(e) =>
                  setCanvas({ ...canvas, problem_definition: e.target.value })
                }
                className="w-full rounded-lg border p-3 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                2. Potrzeby Odbiorców
              </label>
              <textarea
                rows={3}
                value={canvas.target_group_needs}
                onChange={(e) =>
                  setCanvas({ ...canvas, target_group_needs: e.target.value })
                }
                className="w-full rounded-lg border p-3 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                3. Aspekt Innowacyjny
              </label>
              <textarea
                rows={3}
                value={canvas.innovative_aspect}
                onChange={(e) =>
                  setCanvas({ ...canvas, innovative_aspect: e.target.value })
                }
                className="w-full rounded-lg border p-3 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  4. Oczekiwane Rezultaty
                </label>
                <textarea
                  rows={3}
                  value={canvas.expected_outcomes}
                  onChange={(e) =>
                    setCanvas({ ...canvas, expected_outcomes: e.target.value })
                  }
                  className="w-full rounded-lg border p-3 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  5. Ryzyka i Bariery
                </label>
                <textarea
                  rows={3}
                  value={canvas.potential_risks}
                  onChange={(e) =>
                    setCanvas({ ...canvas, potential_risks: e.target.value })
                  }
                  className="w-full rounded-lg border p-3 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/2 rounded-lg border px-4 py-3 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Wróć do edycji
            </button>
            <button
              type="button"
              onClick={handleSaveIdea}
              disabled={loading}
              className="flex w-1/2 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Zapisz Pomysł & Canwę
            </button>
          </div>
        </div>
      )}

      {step === 3 && savedIdeaId && (
        <div className="space-y-6 py-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Pomysł został pomyślnie zapisany!
          </h2>
          <p className="mx-auto max-w-md text-slate-600 dark:text-slate-400">
            Fiszka Innowacji oraz Canwa ROPS zostały utwalone w bazie danych.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <a
              href={`/granty/generator?ideaId=${savedIdeaId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Generuj Wniosek Grantowy <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
