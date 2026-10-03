"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  LightbulbIcon,
  Loader2Icon,
  SaveIcon,
  SparklesIcon,
} from "lucide-react"

import { generateRopsCanvas, type CanvasData } from "@/lib/ai"
import { checkIdeaDuplicates, type SimilarSolution } from "@/app/actions/deduplication"
import { saveIdeaAction } from "@/app/actions/ideas"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Stage } from "@/seed"

const STEPS = ["Opis pomysłu", "Kanwa i podobne innowacje", "Gotowe"]

const STAGE_OPTIONS: { value: Stage; label: string; description: string }[] = [
  { value: "pomysł", label: "Pomysł", description: "Dopiero go opisuję." },
  { value: "pilotaż", label: "Pilotaż", description: "Sprawdzam go w małej skali." },
  { value: "sprawdzona", label: "Sprawdzona", description: "Już działa i ma efekty." },
]

const CANVAS_FIELDS: { key: keyof CanvasData; label: string }[] = [
  { key: "problem_definition", label: "Jaki problem rozwiązuje?" },
  { key: "target_group_needs", label: "Czego potrzebują odbiorcy?" },
  { key: "innovative_aspect", label: "Co w nim jest nowego?" },
  { key: "expected_outcomes", label: "Jakie będą efekty?" },
  { key: "potential_risks", label: "Ryzyka i bariery" },
]

export function IdeaWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [essence, setEssence] = useState("")
  const [audience, setAudience] = useState("")
  const [stage, setStage] = useState<Stage>("pomysł")
  const [authorEmail, setAuthorEmail] = useState("")

  const [similarSolutions, setSimilarSolutions] = useState<SimilarSolution[]>([])
  const [canvas, setCanvas] = useState<CanvasData | null>(null)
  const [savedIdeaId, setSavedIdeaId] = useState<string | null>(null)

  // Po zmianie kroku fokus na nagłówek — czytnik ekranu ogłasza nowy krok.
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (step > 1) headingRef.current?.focus()
  }, [step])

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const [dupResult, ropsCanvas] = await Promise.all([
        checkIdeaDuplicates(title, essence),
        generateRopsCanvas(title, essence, audience),
      ])
      setSimilarSolutions(dupResult.similarSolutions)
      setCanvas(ropsCanvas)
      setStep(2)
    } catch (err) {
      console.error(err)
      setError("Asystent nie odpowiedział. Spróbuj ponownie za chwilę.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await saveIdeaAction({ title, essence, audience, stage, canvas, authorEmail })
      if (!data?.id) throw new Error("Serwer nie zwrócił identyfikatora pomysłu.")
      setSavedIdeaId(data.id)
      setStep(3)
    } catch (err) {
      console.error("Błąd zapisu pomysłu:", err)
      setError("Nie udało się zapisać pomysłu. Spróbuj ponownie za chwilę.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Kroki kreatora">
        <ol className="grid grid-cols-3 gap-3 sm:gap-4">
          {STEPS.map((label, index) => {
            const current = index + 1 === step
            return (
              <li
                key={label}
                aria-current={current ? "step" : undefined}
                className="flex flex-col gap-1 border-t-4 pt-3 text-muted-foreground aria-[current=step]:border-primary aria-[current=step]:text-foreground"
              >
                <span className="text-sm">Krok {index + 1}</span>
                <span className="text-sm font-medium sm:text-base">{label}</span>
              </li>
            )
          })}
        </ol>
      </nav>

      {step === 1 && (
        <Card>
          <form onSubmit={handleAnalyze} className="flex flex-col gap-(--card-spacing)">
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="idea-title">Tytuł pomysłu</FieldLabel>
                  <Input
                    id="idea-title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Np. Cyfrowy asystent seniora w gminie"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="idea-essence">Na czym polega pomysł?</FieldLabel>
                  <FieldDescription id="idea-essence-help">
                    Opisz krótko, co chcesz zmienić i jak ma działać Twoje rozwiązanie.
                  </FieldDescription>
                  <Textarea
                    id="idea-essence"
                    required
                    aria-describedby="idea-essence-help"
                    value={essence}
                    onChange={(e) => setEssence(e.target.value)}
                    placeholder="Mój pomysł polega na..."
                    className="min-h-40"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="idea-audience">Dla kogo? (opcjonalnie)</FieldLabel>
                  <Input
                    id="idea-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Np. osoby 70+ z terenów wiejskich"
                  />
                </Field>

                <FieldSet>
                  <FieldLegend>Etap pomysłu</FieldLegend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {STAGE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 has-checked:border-primary has-checked:bg-muted"
                      >
                        <input
                          type="radio"
                          name="stage"
                          value={option.value}
                          checked={stage === option.value}
                          onChange={() => setStage(option.value)}
                          className="mt-1 size-5 shrink-0 accent-primary"
                        />
                        <span className="flex flex-col gap-1">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-muted-foreground">{option.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </FieldSet>

                <Field className="max-w-md">
                  <FieldLabel htmlFor="idea-email">E-mail do kontaktu (opcjonalnie)</FieldLabel>
                  <Input
                    id="idea-email"
                    type="email"
                    autoComplete="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="np. jan@example.com"
                  />
                  <FieldDescription>Napiszemy, gdy ROPS oceni pomysł. Nie pokazujemy go publicznie.</FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>

            <CardFooter className="border-t">
              <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <Loader2Icon data-icon="inline-start" aria-hidden className="motion-safe:animate-spin" />
                ) : (
                  <SparklesIcon data-icon="inline-start" aria-hidden />
                )}
                {loading ? "Analizuję pomysł…" : "Przygotuj kanwę z asystentem"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === 2 && canvas && (
        <section aria-labelledby="step-2-heading" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="step-2-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">
              Sprawdź kanwę pomysłu
            </h2>
            <p className="text-muted-foreground">Asystent ułożył Twój opis w pięć części. Popraw, co chcesz.</p>
          </div>

          {similarSolutions.length > 0 ? (
            <Alert role="note">
              <LightbulbIcon aria-hidden />
              <AlertTitle>Podobne innowacje już istnieją</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-3">
                <p>Zobacz, co już działa. Może wystarczy dostosować gotowe rozwiązanie.</p>
                <ul className="flex flex-col gap-2">
                  {similarSolutions.map((solution) => (
                    <li key={solution.id}>
                      <Link
                        href={`/innowacja/${solution.id}`}
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        {solution.title}
                      </Link>{" "}
                      <span className="text-muted-foreground">
                        (podobieństwo {Math.round(solution.similarity * 100)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert role="note">
              <CheckCircle2Icon aria-hidden />
              <AlertTitle>Nie znaleźliśmy podobnych innowacji</AlertTitle>
              <AlertDescription>Twój pomysł może być czymś nowym w bibliotece.</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent>
              <FieldGroup className="sm:grid sm:grid-cols-2">
                {CANVAS_FIELDS.map(({ key, label }, index) => (
                  <Field key={key} className={index < 3 ? "sm:col-span-2" : undefined}>
                    <FieldLabel htmlFor={`canvas-${key}`}>{label}</FieldLabel>
                    <Textarea
                      id={`canvas-${key}`}
                      value={canvas[key]}
                      onChange={(e) => setCanvas({ ...canvas, [key]: e.target.value })}
                    />
                  </Field>
                ))}
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-col-reverse gap-3 border-t sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)} className="w-full sm:w-auto">
                <ArrowLeftIcon data-icon="inline-start" aria-hidden />
                Wróć do opisu
              </Button>
              <Button type="button" size="lg" onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <Loader2Icon data-icon="inline-start" aria-hidden className="motion-safe:animate-spin" />
                ) : (
                  <SaveIcon data-icon="inline-start" aria-hidden />
                )}
                {loading ? "Zapisuję…" : "Zapisz pomysł"}
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {step === 3 && savedIdeaId && (
        <section aria-labelledby="step-3-heading" className="flex flex-col gap-6">
          <h2 id="step-3-heading" ref={headingRef} tabIndex={-1} className="sr-only">
            Gotowe
          </h2>
          <Alert role="status">
            <CheckCircle2Icon aria-hidden />
            <AlertTitle>Pomysł został zapisany</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-4">
              <p>Pracownicy ROPS zobaczą go w panelu. Możesz już przygotować szkic wniosku o grant.</p>
              <Link href={`/granty/generator?ideaId=${savedIdeaId}`} className={buttonVariants({ size: "lg" })}>
                Przygotuj wniosek o grant
                <ArrowRightIcon data-icon="inline-end" aria-hidden />
              </Link>
            </AlertDescription>
          </Alert>
        </section>
      )}

      <div aria-live="polite" className="flex flex-col gap-4">
        {loading && step === 1 && (
          <p className="text-muted-foreground">
            Asystent sprawdza bibliotekę i układa kanwę. To może potrwać do minuty.
          </p>
        )}
        {!loading && error && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertTitle>Coś poszło nie tak</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
