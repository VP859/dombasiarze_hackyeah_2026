"use client"

import { useState, useTransition } from "react"
import { CircleAlertIcon, Loader2Icon, SparklesIcon } from "lucide-react"

import { developIdeaAction } from "@/app/actions/ideas"
import type { IdeaTips } from "@/lib/ai"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const SECTIONS: { key: keyof IdeaTips; title: string }[] = [
  { key: "questions", title: "Pytania do przemyślenia" },
  { key: "unconventional_ideas", title: "Nietuzinkowe pomysły" },
  { key: "next_steps", title: "Pierwsze kroki do testu" },
]

export function IdeaAssistant({ ideaId }: { ideaId: string }) {
  const [tips, setTips] = useState<IdeaTips | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const ask = () => {
    setError(null)
    startTransition(async () => {
      const result = await developIdeaAction(ideaId)
      if (result.ok) setTips(result.tips)
      else setError(result.error)
    })
  }

  return (
    <section aria-labelledby="assistant-heading" className="flex flex-col gap-6 rounded-4xl bg-muted p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h2 id="assistant-heading" className="flex items-center gap-3 text-2xl font-bold">
          <SparklesIcon aria-hidden className="size-6 text-primary" />
          Asystent kreatora
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          Podpowie, jak rozwinąć pomysł, zaproponuje nietuzinkowe warianty i pierwsze kroki do testu w małej
          skali.
        </p>
      </div>

      <Button type="button" size="lg" onClick={ask} disabled={isPending} className="self-start">
        {isPending ? (
          <Loader2Icon data-icon="inline-start" aria-hidden className="motion-safe:animate-spin" />
        ) : (
          <SparklesIcon data-icon="inline-start" aria-hidden />
        )}
        {isPending ? "Asystent myśli…" : tips ? "Poproś o nowe podpowiedzi" : "Poproś o podpowiedzi"}
      </Button>

      <div aria-live="polite" className="flex flex-col gap-6">
        {!isPending && error && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertTitle>Coś poszło nie tak</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isPending && tips && (
          <div className="grid gap-8 md:grid-cols-3">
            {SECTIONS.map(({ key, title }) => (
              <div key={key} className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                <ul className="flex list-disc flex-col gap-2 pl-5">
                  {tips[key].map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
