import type { Metadata } from "next"

import { EmptyState } from "@/components/empty-state"
import { InnovationCard } from "@/components/innovation-card"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { getAudiences, getChallenges, getSolutions, STAGES } from "@/seed"

export const metadata: Metadata = { title: "Biblioteka innowacji" }

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

// Filtry to zwykły formularz GET: stan w URL (Select wysyła wartość ukrytym polem `name`). Zwykłe <a> (nie Link) czyści filtry
// pełnym przeładowaniem — inaczej pola zachowałyby stare wartości.
export default async function Page({ searchParams }: PageProps<"/biblioteka">) {
  const params = await searchParams
  const filters = {
    q: first(params.q),
    challenge: first(params.challenge),
    audience: first(params.audience),
    stage: first(params.stage),
  }
  const results = getSolutions(filters)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">Biblioteka innowacji</h1>
        <p className="max-w-2xl text-muted-foreground">
          Rozwiązania, które działają w innych gminach. Wybierz filtry i kliknij „Pokaż wyniki”.
        </p>
      </div>

      <form method="get" action="/biblioteka" className="flex flex-col gap-6 rounded-4xl border p-6">
        <FieldGroup className="md:grid md:grid-cols-2 lg:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="q">Szukaj</FieldLabel>
            <Input id="q" name="q" type="search" defaultValue={filters.q} placeholder="np. seniorzy" />
          </Field>
          <FilterSelect
            id="challenge"
            label="Wyzwanie"
            value={filters.challenge}
            items={[
              { value: null, label: "Wszystkie wyzwania" },
              ...getChallenges().map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FilterSelect
            id="audience"
            label="Dla kogo"
            value={filters.audience}
            items={[
              { value: null, label: "Wszyscy odbiorcy" },
              ...getAudiences().map((a) => ({ value: a, label: a })),
            ]}
          />
          <FilterSelect
            id="stage"
            label="Etap"
            value={filters.stage}
            items={[
              { value: null, label: "Każdy etap" },
              ...STAGES.map((st) => ({ value: st, label: st })),
            ]}
          />
        </FieldGroup>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Pokaż wyniki</Button>
          <a href="/biblioteka" className={buttonVariants({ variant: "secondary" })}>
            Wyczyść filtry
          </a>
        </div>
      </form>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Wyniki</h2>
          <p role="status" aria-live="polite" className="text-muted-foreground">
            Liczba znalezionych innowacji: {results.length}
          </p>
        </div>
        {results.length ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((solution) => (
              <li key={solution.id}>
                <InnovationCard solution={solution} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Brak innowacji dla tych filtrów"
            description="Zmień filtry albo wyczyść je, żeby zobaczyć wszystkie innowacje."
          >
            <a href="/biblioteka" className={buttonVariants({ variant: "secondary" })}>
              Wyczyść filtry
            </a>
          </EmptyState>
        )}
      </section>
    </div>
  )
}

function FilterSelect({
  id,
  label,
  value,
  items,
}: {
  id: string
  label: string
  value: string
  items: { value: string | null; label: string }[]
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select id={id} name={id} items={items} defaultValue={value || null}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.label} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
