"use client"

import { useActionState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, CheckCircle2Icon, CircleAlertIcon } from "lucide-react"

import { signUpForTest } from "@/app/actions/solutions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TestSignupFormProps = {
  innovationId: string
  name: string
  description: string
  signedUp: number
}

export function TestSignupForm({ innovationId, name, description, signedUp }: TestSignupFormProps) {
  const [state, formAction, isPending] = useActionState(signUpForTest, null)

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

      {state?.ok ? (
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
            <form action={formAction} className="flex flex-col gap-8">
              <input type="hidden" name="solution_id" value={innovationId} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Imię</FieldLabel>
                  <Input id="name" name="name" type="text" autoComplete="given-name" required maxLength={100} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </Field>
                <Field orientation="horizontal">
                  <input
                    id="contact-consent"
                    name="consent"
                    type="checkbox"
                    required
                    className="size-5 shrink-0 accent-primary"
                  />
                  <FieldLabel htmlFor="contact-consent" className="font-normal">
                    Zgadzam się na kontakt w sprawie testu tej innowacji.
                  </FieldLabel>
                </Field>
              </FieldGroup>
              {state && !state.ok && (
                <Alert variant="destructive" role="alert">
                  <CircleAlertIcon aria-hidden />
                  <AlertTitle>Nie udało się zapisać</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto sm:self-start">
                {isPending ? "Zapisuję…" : "Zapisz się do testu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground">
        Już testujesz tę innowację?{" "}
        <Link href={`/innowacja/${innovationId}#opinia`} className="font-medium text-foreground underline underline-offset-4">
          Oceń ją i zaproponuj usprawnienia
        </Link>
      </p>
    </div>
  )
}
