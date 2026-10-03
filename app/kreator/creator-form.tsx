"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"

const stages = [
  {
    value: "pomysł",
    label: "Pomysł",
    description: "Dopiero go opisuję.",
  },
  {
    value: "pilotaż",
    label: "Pilotaż",
    description: "Sprawdzam go w małej skali.",
  },
  {
    value: "działa",
    label: "Działa",
    description: "Jest już wdrażany.",
  },
] as const

export function CreatorForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section
        className="rounded-3xl border border-emerald-700 bg-emerald-50 p-6 text-emerald-950 shadow-sm sm:p-10 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 aria-hidden="true" className="mb-4 size-9" />
        <h2 className="text-2xl font-semibold">Fiszka została zapisana</h2>
        <p className="mt-3 max-w-xl leading-7">
          Twój pomysł jest gotowy do kolejnego kroku. W następnej części rozwiniesz go z asystentem.
        </p>
        <Link href="/kreator/nowy-pomysl" className="mt-6 inline-flex">
          <Button size="lg">
            Rozwiń pomysł z asystentem
            <ArrowRight aria-hidden="true" />
          </Button>
        </Link>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 rounded-3xl border bg-card p-6 shadow-sm sm:p-10"
    >
      <div>
        <label htmlFor="idea-title" className="mb-2 block font-medium">
          Tytuł pomysłu
        </label>
        <input
          id="idea-title"
          name="title"
          type="text"
          required
          placeholder="Np. Sąsiedzkie wsparcie dla opiekunów"
          className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      <div>
        <label htmlFor="idea-description" className="mb-2 block font-medium">
          Na czym polega pomysł?
        </label>
        <p id="idea-description-help" className="mb-2 text-sm text-muted-foreground">
          Opisz krótko, co chcesz zmienić i jak ma działać Twoje rozwiązanie.
        </p>
        <textarea
          id="idea-description"
          name="description"
          required
          rows={7}
          aria-describedby="idea-description-help"
          placeholder="Mój pomysł polega na..."
          className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      <div>
        <label htmlFor="idea-audience" className="mb-2 block font-medium">
          Dla kogo?
        </label>
        <p id="idea-audience-help" className="mb-2 text-sm text-muted-foreground">
          Kto skorzysta z tego pomysłu?
        </p>
        <input
          id="idea-audience"
          name="audience"
          type="text"
          required
          aria-describedby="idea-audience-help"
          placeholder="Np. osoby starsze mieszkające samotnie"
          className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      <fieldset>
        <legend className="mb-3 font-medium">Etap pomysłu</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {stages.map((stage, index) => (
            <label
              key={stage.value}
              className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-input p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/10"
            >
              <input
                type="radio"
                name="stage"
                value={stage.value}
                defaultChecked={index === 0}
                className="mt-1 size-5 accent-primary"
              />
              <span>
                <span className="block font-medium">{stage.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{stage.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="border-t pt-6">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Zapisz i rozwiń z asystentem
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}
