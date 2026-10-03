"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
      <Alert role="status">
        <CheckCircle2Icon aria-hidden />
        <AlertTitle>Fiszka została zapisana</AlertTitle>
        <AlertDescription>
          Twój pomysł jest gotowy do kolejnego kroku. W następnej części rozwiniesz go z asystentem.
        </AlertDescription>
        <div className="col-start-2 mt-4">
          <Link href="/kreator/nowy-pomysl" className={buttonVariants({ size: "lg" })}>
            Rozwiń pomysł z asystentem
            <ArrowRightIcon data-icon="inline-end" aria-hidden />
          </Link>
        </div>
      </Alert>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-(--card-spacing)">
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="idea-title">Tytuł pomysłu</FieldLabel>
              <Input
                id="idea-title"
                name="title"
                type="text"
                required
                placeholder="Np. Sąsiedzkie wsparcie dla opiekunów"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="idea-description">Na czym polega pomysł?</FieldLabel>
              <FieldDescription id="idea-description-help">
                Opisz krótko, co chcesz zmienić i jak ma działać Twoje rozwiązanie.
              </FieldDescription>
              <Textarea
                id="idea-description"
                name="description"
                required
                aria-describedby="idea-description-help"
                placeholder="Mój pomysł polega na..."
                className="min-h-40"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="idea-audience">Dla kogo?</FieldLabel>
              <FieldDescription id="idea-audience-help">Kto skorzysta z tego pomysłu?</FieldDescription>
              <Input
                id="idea-audience"
                name="audience"
                type="text"
                required
                aria-describedby="idea-audience-help"
                placeholder="Np. osoby starsze mieszkające samotnie"
              />
            </Field>

            <FieldSet>
              <FieldLegend>Etap pomysłu</FieldLegend>
              <div className="grid gap-3 sm:grid-cols-3">
                {stages.map((stage, index) => (
                  <label
                    key={stage.value}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 has-checked:border-primary has-checked:bg-muted"
                  >
                    <input
                      type="radio"
                      name="stage"
                      value={stage.value}
                      defaultChecked={index === 0}
                      className="mt-1 size-5 shrink-0 accent-primary"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">{stage.label}</span>
                      <span className="text-muted-foreground">{stage.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        <CardFooter className="border-t">
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Zapisz i rozwiń z asystentem
            <ArrowRightIcon data-icon="inline-end" aria-hidden />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
