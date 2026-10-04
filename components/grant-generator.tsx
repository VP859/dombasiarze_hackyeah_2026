"use client"

import { type FormEvent, useState } from "react"
import { CheckIcon, CircleAlertIcon, Loader2Icon, SparklesIcon } from "lucide-react"

import { generateAndSaveGrantApplication } from "@/app/actions/grant-generator"
import { formatDate } from "@/app/panel/format"
import type { GrantApplicationContent } from "@/lib/ai"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Call = { id: string; title: string; deadline: string | null }

const pln = (value: number) => `${value.toLocaleString("pl-PL")} zł`

export function GrantGeneratorForm({ ideaId, availableCalls }: { ideaId: string; availableCalls: Call[] }) {
  const [loading, setLoading] = useState(false)
  const [application, setApplication] = useState<GrantApplicationContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const items = availableCalls.map((call) => ({
    value: call.id,
    label: call.deadline ? `${call.title} (do ${formatDate(call.deadline)})` : call.title,
  }))

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const callId = String(new FormData(event.currentTarget).get("callId") ?? "")
    setLoading(true)
    setError(null)
    setApplication(null)

    try {
      const result = await generateAndSaveGrantApplication(ideaId, callId)
      if (result.ok) setApplication(result.application)
      else setError(result.error)
    } catch (err) {
      console.error(err)
      setError("Nie udało się przygotować wniosku. Spróbuj ponownie za chwilę.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          <form onSubmit={handleGenerate} className="flex flex-col gap-8">
            <Field>
              <FieldLabel htmlFor="callId">Nabór</FieldLabel>
              <Select id="callId" name="callId" items={items} defaultValue={items[0]?.value}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>Asystent dopasuje wniosek do zasad wybranego naboru.</FieldDescription>
            </Field>
            <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto sm:self-start">
              {loading ? (
                <Loader2Icon data-icon="inline-start" aria-hidden className="motion-safe:animate-spin" />
              ) : (
                <SparklesIcon data-icon="inline-start" aria-hidden />
              )}
              {loading ? "Przygotowuję wniosek…" : "Przygotuj szkic wniosku"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div aria-live="polite" className="flex flex-col gap-6">
        {loading && (
          <p className="text-muted-foreground">Asystent pisze szkic wniosku. To może potrwać do minuty.</p>
        )}
        {!loading && error && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertTitle>Coś poszło nie tak</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && application && <Application application={application} />}
      </div>
    </>
  )
}

function Application({ application }: { application: GrantApplicationContent }) {
  const total = application.budget_breakdown.reduce((sum, item) => sum + item.estimated_cost_pln, 0)

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Szkic wniosku</p>
        <CardTitle>
          <h2 className="text-2xl">{application.project_title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Streszczenie</h3>
          <p className="max-w-[65ch]">{application.executive_summary}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Zgodność z naborem</h3>
          <p className="max-w-[65ch]">{application.problem_alignment}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Harmonogram</h3>
          <ol className="flex list-decimal flex-col gap-3 pl-6 marker:font-semibold">
            {application.detailed_schedule.map((step) => (
              <li key={step} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Kosztorys</h3>
          <Table>
            <TableCaption className="sr-only">Szacunkowe koszty projektu w złotych</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Wydatek</TableHead>
                <TableHead className="text-right">Koszt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {application.budget_breakdown.map((item) => (
                <TableRow key={item.item}>
                  <TableCell className="whitespace-normal">{item.item}</TableCell>
                  <TableCell className="text-right tabular-nums">{pln(item.estimated_cost_pln)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">Razem</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{pln(total)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Co dalej po grancie</h3>
          <p className="max-w-[65ch]">{application.sustainability_plan}</p>
        </section>

        <p className="flex gap-3 text-muted-foreground">
          <CheckIcon aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
          Szkic zapisaliśmy. Pracownicy ROPS zobaczą go razem z Twoim pomysłem.
        </p>
      </CardContent>
    </Card>
  )
}
