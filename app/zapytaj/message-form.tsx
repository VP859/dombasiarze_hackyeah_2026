"use client"

import { useActionState } from "react"
import Link from "next/link"
import { CircleAlertIcon, Loader2Icon, SendIcon } from "lucide-react"

import { sendMessageAction } from "@/app/actions/messages-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MESSAGE_RECIPIENTS, MESSAGE_TOPICS, type MessageRecipient } from "@/seed"

const CHIP =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 has-checked:border-primary has-checked:bg-muted"
const TAG =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 has-checked:border-primary has-checked:bg-muted"

type Props = {
  context: { about: string; link: string } | null
  defaults: { recipient: MessageRecipient; topic: string; body: string }
}

// Akcja serwera: działa też bez JS. Po wysłaniu przekierowuje na stronę sprawy z odpowiedzią.
export function MessageForm({ context, defaults }: Props) {
  const [state, formAction, isPending] = useActionState(sendMessageAction, null)

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-8">
          <input type="hidden" name="link" value={context?.link ?? ""} />
          <input type="hidden" name="about" value={context?.about ?? ""} />

          {context && (
            <p>
              <span className="text-muted-foreground">Pytanie dotyczy:</span>{" "}
              <Link href={context.link} className="font-medium underline underline-offset-4">
                {context.about}
              </Link>
            </p>
          )}

          <FieldGroup>
            <FieldSet>
              <FieldLegend>Do kogo piszesz?</FieldLegend>
              <div className="grid gap-3 sm:grid-cols-2">
                {MESSAGE_RECIPIENTS.map((r) => (
                  <label key={r.value} className={CHIP}>
                    <input
                      type="radio"
                      name="recipient"
                      value={r.value}
                      required
                      defaultChecked={r.value === defaults.recipient}
                      className="mt-1 size-5 shrink-0 accent-primary"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">{r.label}</span>
                      <span className="text-muted-foreground">{r.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Temat</FieldLegend>
              <div className="flex flex-wrap gap-2">
                {MESSAGE_TOPICS.map((topic) => (
                  <label key={topic} className={TAG}>
                    <input
                      type="radio"
                      name="topic"
                      value={topic}
                      required
                      defaultChecked={topic === defaults.topic}
                      className="size-4 shrink-0 accent-primary"
                    />
                    {topic}
                  </label>
                ))}
              </div>
            </FieldSet>

            <Field>
              <FieldLabel htmlFor="message-body">Twoje pytanie</FieldLabel>
              <Textarea
                id="message-body"
                name="body"
                required
                maxLength={5000}
                defaultValue={defaults.body}
                className="min-h-40"
                placeholder="Np. Czy gmina może dostać wsparcie przy wdrożeniu tej innowacji?"
              />
              <FieldDescription>Możesz też kliknąć mikrofon i powiedzieć, o co chcesz zapytać.</FieldDescription>
            </Field>

            <Field className="max-w-md">
              <FieldLabel htmlFor="message-email">E-mail</FieldLabel>
              <Input id="message-email" name="email" type="email" required autoComplete="email" />
              <FieldDescription>Wyślemy na niego odpowiedź. Nie pokazujemy go publicznie.</FieldDescription>
            </Field>

            <Field orientation="horizontal">
              <input
                id="message-consent"
                name="consent"
                type="checkbox"
                required
                className="size-5 shrink-0 accent-primary"
              />
              <FieldLabel htmlFor="message-consent" className="font-normal">
                Zgadzam się na kontakt e-mailowy w tej sprawie.
              </FieldLabel>
            </Field>
          </FieldGroup>

          {state?.error && (
            <Alert variant="destructive" role="alert">
              <CircleAlertIcon aria-hidden />
              <AlertTitle>Nie udało się wysłać</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto sm:self-start">
            {isPending ? (
              <Loader2Icon data-icon="inline-start" aria-hidden className="motion-safe:animate-spin" />
            ) : (
              <SendIcon data-icon="inline-start" aria-hidden />
            )}
            {isPending ? "Wysyłam…" : "Wyślij pytanie"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
