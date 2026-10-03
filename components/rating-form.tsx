"use client"

import { FormEvent, useState } from "react"
import { CheckCircle2Icon, StarIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Oceń tę innowację</h2>
        </CardTitle>
        <CardDescription>Twoja opinia pomoże ją lepiej rozwijać.</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <Alert role="status">
            <CheckCircle2Icon aria-hidden />
            <AlertDescription>Dziękujemy za opinię.</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Ocena</FieldLegend>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1
                    const selected = value <= rating

                    return (
                      <Button
                        key={value}
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${value} ${value === 1 ? "gwiazdka" : value < 5 ? "gwiazdki" : "gwiazdek"}`}
                        aria-pressed={value === rating}
                        onClick={() => setRating(value)}
                      >
                        <StarIcon aria-hidden className={cn("size-7", selected && "fill-current")} />
                      </Button>
                    )
                  })}
                </div>
                {rating === 0 && <FieldDescription>Wybierz ocenę, aby wysłać formularz.</FieldDescription>}
              </FieldSet>

              <Field>
                <FieldLabel htmlFor="opinion">Opinia</FieldLabel>
                <Textarea
                  id="opinion"
                  name="opinion"
                  value={opinion}
                  onChange={(event) => setOpinion(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="improvement">Co poprawić?</FieldLabel>
                <Textarea
                  id="improvement"
                  name="improvement"
                  value={improvement}
                  onChange={(event) => setImprovement(event.target.value)}
                />
              </Field>
            </FieldGroup>

            <Button type="submit" size="lg" className="self-start">
              Wyślij opinię
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
