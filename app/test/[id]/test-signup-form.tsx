"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TestSignupFormProps = {
  innovationId: string
  name: string
  description: string
}

export function TestSignupForm({ innovationId, name, description }: TestSignupFormProps) {
  const signedUp = 12
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href={`/innowacja/${innovationId}`}
          className="flex w-fit items-center gap-2 underline underline-offset-4"
        >
          <ArrowLeftIcon aria-hidden className="size-5" />
          Wróć do innowacji
        </Link>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Nabór do testu</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">{name}</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">{description}</p>
        <p className="font-medium" aria-live="polite">
          Zapisanych: {signedUp}
        </p>
      </div>

      {submitted ? (
        <Alert role="status">
          <CheckCircle2Icon aria-hidden />
          <AlertTitle>Dziękujemy za zgłoszenie</AlertTitle>
          <AlertDescription>
            Zapisaliśmy Twoje zgłoszenie. Skontaktujemy się z Tobą, gdy rozpoczniemy test.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Imię</FieldLabel>
                  <Input id="name" name="name" type="text" autoComplete="given-name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </Field>
                <Field orientation="horizontal">
                  <input
                    id="contact-consent"
                    name="contactConsent"
                    type="checkbox"
                    required
                    className="size-5 shrink-0 accent-primary"
                  />
                  <FieldLabel htmlFor="contact-consent" className="font-normal">
                    Zgadzam się na kontakt w sprawie testu tej innowacji.
                  </FieldLabel>
                </Field>
              </FieldGroup>
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start">
                Zapisz się do testu
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
