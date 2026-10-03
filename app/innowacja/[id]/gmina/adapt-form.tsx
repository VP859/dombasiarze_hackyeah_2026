"use client"

import { startTransition, useActionState } from "react"
import { CheckIcon, CircleAlertIcon, Loader2Icon, Wand2Icon } from "lucide-react"

import { adaptInnovationAction, type AdaptationResult } from "@/app/actions/adapt-innovation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TYPES = [
  { value: "wiejska", label: "Wiejska" },
  { value: "miejsko-wiejska", label: "Miejsko-wiejska" },
  { value: "miejska", label: "Miejska" },
  { value: "powiat", label: "Powiat / związek gmin" },
]

export function AdaptForm({ solutionId }: { solutionId: string }) {
  const [state, formAction, pending] = useActionState(adaptInnovationAction, null)

  return (
    <>
      <Card>
        <CardContent>
          <form
            action={formAction}
            onSubmit={(event) => {
              // Wysyłamy sami, żeby React nie czyścił formularza — wpisane dane zostają do poprawek.
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              startTransition(() => formAction(formData))
            }}
            className="flex flex-col gap-8"
          >
            <input type="hidden" name="solutionId" value={solutionId} />
            <FieldGroup className="sm:grid sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="gminaName">Nazwa gminy</FieldLabel>
                <Input
                  id="gminaName"
                  name="gminaName"
                  required
                  placeholder="np. Gmina Miechów"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="population">Liczba mieszkańców</FieldLabel>
                <Input
                  id="population"
                  name="population"
                  inputMode="numeric"
                  required
                  placeholder="np. 12 500"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="type">Typ gminy</FieldLabel>
                <Select id="type" name="type" items={TYPES} defaultValue="miejsko-wiejska">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="budgetConstraint">Możliwości budżetowe</FieldLabel>
                <Input
                  id="budgetConstraint"
                  name="budgetConstraint"
                  required
                  placeholder="np. do 50 000 zł, środki własne"
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="specificChallenges">Lokalne wyzwania i bariery</FieldLabel>
                <Textarea
                  id="specificChallenges"
                  name="specificChallenges"
                  placeholder="np. rozproszone sołectwa, słaby transport, mało osób z umiejętnościami cyfrowymi"
                />
              </Field>
            </FieldGroup>
            <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:self-start">
              {pending ? (
                <Loader2Icon data-icon="inline-start" aria-hidden className="motion-safe:animate-spin" />
              ) : (
                <Wand2Icon data-icon="inline-start" aria-hidden />
              )}
              {pending ? "Przygotowuję plan…" : "Przygotuj plan wdrożenia"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div aria-live="polite" className="flex flex-col gap-6">
        {pending && (
          <p className="text-muted-foreground">Asystent analizuje Twoją gminę. To może potrwać do minuty.</p>
        )}
        {!pending && state?.error && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertTitle>Nie udało się przygotować planu</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {!pending && state?.result && <Report gminaName={state.input.gminaName} result={state.result} />}
      </div>
    </>
  )
}

function Report({ gminaName, result }: { gminaName: string; result: AdaptationResult }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Plan wdrożenia</p>
        <CardTitle>
          <h2 className="text-2xl">{gminaName}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <p className="max-w-[65ch]">{result.summary}</p>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Kroki wdrożenia</h3>
          <ol className="flex list-decimal flex-col gap-3 pl-6 marker:font-semibold">
            {result.action_plan.map((step) => (
              <li key={step} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Możliwe bariery</h3>
          <ul className="flex list-disc flex-col gap-2 pl-6">
            {result.local_barriers.map((barrier) => (
              <li key={barrier}>{barrier}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Budżet i finansowanie</h3>
          <p className="max-w-[65ch]">{result.estimated_budget_notes}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Jak zmierzyć sukces</h3>
          <ul className="flex flex-col gap-2">
            {result.kpis.map((kpi) => (
              <li key={kpi} className="flex gap-3">
                <CheckIcon aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
                {kpi}
              </li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  )
}
