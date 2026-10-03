"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type TestSignupFormProps = {
  innovationId: string
}

const innovation = {
  name: "Sąsiedzkie odwiedziny u seniorów",
  description:
    "Program łączy osoby starsze z przeszkolonymi sąsiadami, którzy regularnie odwiedzają ich w domu. Razem sprawdzimy, jak takie wsparcie działa w gminie.",
}

export function TestSignupForm({ innovationId }: TestSignupFormProps) {
  const signedUp = 12
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-svh bg-stone-50 px-4 py-8 text-stone-900 sm:px-6 sm:py-12 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/innowacja/${innovationId}`}
          className="mb-10 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-stone-700 underline-offset-4 hover:bg-stone-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Wróć do innowacji
        </Link>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
              Nabór do testu
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {innovation.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-stone-600 dark:text-stone-300">
              {innovation.description}
            </p>
            <p
              className="mt-5 font-medium text-emerald-900 dark:text-emerald-300"
              aria-live="polite"
            >
              Zapisanych: {signedUp}
            </p>
          </div>

          {submitted ? (
            <div
              className="rounded-2xl border border-emerald-700 bg-emerald-50 p-6 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 aria-hidden="true" className="mb-3 size-8" />
              <h2 className="text-xl font-semibold">Dziękujemy za zgłoszenie</h2>
              <p className="mt-2 leading-7">
                Zapisaliśmy Twoje zgłoszenie. Skontaktujemy się z Tobą, gdy
                rozpoczniemy test.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="mb-2 block font-medium">
                  Imię
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="min-h-11 w-full rounded-xl border border-stone-400 bg-white px-4 text-base outline-none focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-emerald-700/30 dark:border-stone-600 dark:bg-stone-950"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block font-medium">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="min-h-11 w-full rounded-xl border border-stone-400 bg-white px-4 text-base outline-none focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-emerald-700/30 dark:border-stone-600 dark:bg-stone-950"
                />
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-stone-300 p-4 dark:border-stone-700">
                <input
                  name="contactConsent"
                  type="checkbox"
                  required
                  className="mt-1 size-5 accent-emerald-700"
                />
                <span className="leading-7">
                  Zgadzam się na kontakt w sprawie testu tej innowacji.
                </span>
              </label>

              <Button type="submit" size="lg" className="min-h-11 w-full sm:w-auto">
                Zapisz się do testu
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}




