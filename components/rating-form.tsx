"use client"

import { FormEvent, useState } from "react"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"

type RatingFormProps = {
  onSubmit?: (rating: number, opinion: string, improvement: string) => void
}

export function RatingForm({ onSubmit }: RatingFormProps) {
  const [rating, setRating] = useState(0)
  const [opinion, setOpinion] = useState("")
  const [improvement, setImprovement] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (rating === 0) {
      return
    }

    onSubmit?.(rating, opinion, improvement)
    setSubmitted(true)
  }

  return (
    <section
      aria-labelledby="rating-heading"
      className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900"
    >
      <h2 id="rating-heading" className="text-2xl font-semibold tracking-tight">
        Oceń tę innowację
      </h2>
      <p className="mt-2 text-stone-600 dark:text-stone-300">
        Twoja opinia pomoże ją lepiej rozwijać.
      </p>

      {submitted ? (
        <p
          className="mt-6 rounded-2xl border border-emerald-700 bg-emerald-50 p-4 leading-7 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
          aria-live="polite"
        >
          Dziękujemy za opinię.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <fieldset>
            <legend className="mb-3 font-medium">Ocena</legend>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Wybierz ocenę od 1 do 5">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1
                const selected = value <= rating

                return (
                  <button
                    key={value}
                    type="button"
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-amber-500 outline-none transition-colors hover:bg-amber-50 focus-visible:ring-3 focus-visible:ring-emerald-700/40 dark:hover:bg-amber-950/40"
                    aria-label={`${value} ${value === 1 ? "gwiazdka" : "gwiazdki"}`}
                    aria-pressed={selected}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      aria-hidden="true"
                      className="size-7"
                      fill={selected ? "currentColor" : "none"}
                    />
                  </button>
                )
              })}
            </div>
            {rating === 0 && (
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                Wybierz ocenę, aby wysłać formularz.
              </p>
            )}
          </fieldset>

          <div>
            <label htmlFor="opinion" className="mb-2 block font-medium">
              Opinia
            </label>
            <textarea
              id="opinion"
              name="opinion"
              value={opinion}
              onChange={(event) => setOpinion(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-stone-400 bg-white px-4 py-3 text-base outline-none focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-emerald-700/30 dark:border-stone-600 dark:bg-stone-950"
            />
          </div>

          <div>
            <label htmlFor="improvement" className="mb-2 block font-medium">
              Co poprawić?
            </label>
            <textarea
              id="improvement"
              name="improvement"
              value={improvement}
              onChange={(event) => setImprovement(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-stone-400 bg-white px-4 py-3 text-base outline-none focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-emerald-700/30 dark:border-stone-600 dark:bg-stone-950"
            />
          </div>

          <Button type="submit" size="lg" className="min-h-11">
            Wyślij opinię
          </Button>
        </form>
      )}
    </section>
  )
}
