import type { Metadata } from "next"
import { SearchIcon, XIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { InnovationCard } from "@/components/innovation-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import { getAudiences, getChallenges, getSolutions, STAGES } from "@/seed"

export const metadata: Metadata = { title: "Biblioteka innowacji" }

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

// Filtry to zwykły formularz GET: stan w URL (Select wysyła wartość ukrytym polem `name`).
// Pasek wyszukiwania to <form id="filtry">, a listy w bocznej kolumnie należą do niego przez atrybut `form`.
// Zwykłe <a> (nie Link) czyści filtry pełnym przeładowaniem — inaczej pola zachowałyby stare wartości.
export default async function Page({ searchParams }: PageProps<"/biblioteka">) {
  const params = await searchParams
  const filters = {
    q: first(params.q),
    challenge: first(params.challenge),
    audience: first(params.audience),
    stage: first(params.stage),
  }
  const results = getSolutions(filters)
  const challenges = getChallenges()

  const labels: Record<keyof typeof filters, string> = {
    q: filters.q && `„${filters.q}”`,
    challenge: challenges.find((c) => c.id === filters.challenge)?.name ?? "",
    audience: filters.audience,
    stage: filters.stage,
  }
  const active = (Object.keys(labels) as (keyof typeof filters)[]).filter((key) => labels[key])
  const without = (key: keyof typeof filters) => {
    const rest = new URLSearchParams(Object.entries(filters).filter(([k, v]) => k !== key && v)).toString()
    return rest ? `/biblioteka?${rest}` : "/biblioteka"
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">Biblioteka innowacji</h1>
        <p className="max-w-2xl text-muted-foreground">
          Rozwiązania, które działają w innych gminach. Wpisz, czego szukasz, albo wybierz filtry.
        </p>
      </div>

      {/* Przykleja się pod headerem (wysokość headera: 4.25rem + 1px), tylko przy wysokim oknie. */}
      <form
        id="filtry"
        method="get"
        action="/biblioteka"
        role="search"
        className="top-[calc(4.25rem+1px)] z-30 -mx-4 flex items-center gap-3 border-y bg-background/85 px-4 py-3 backdrop-blur-md [@media(min-height:30rem)]:sticky [@media(prefers-reduced-transparency:reduce)]:bg-background"
      >
        <label htmlFor="q" className="font-medium">
          Szukaj
        </label>
        <Input id="q" name="q" type="search" defaultValue={filters.q} placeholder="np. seniorzy" />
        <Button type="submit" aria-label="Pokaż wyniki">
          <SearchIcon data-icon="inline-start" aria-hidden />
          <span className="hidden sm:inline">Pokaż wyniki</span>
        </Button>
      </form>

      <div className="grid items-start gap-8 lg:grid-cols-[17rem_1fr]">
        <Card className="lg:sticky lg:top-[calc(10rem+2px)]">
          <CardHeader>
            <CardTitle>
              <h2>Filtry</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-5">
              <FilterSelect
                id="challenge"
                label="Wyzwanie"
                value={filters.challenge}
                items={[
                  { value: null, label: "Wszystkie wyzwania" },
                  ...challenges.map((c) => ({ value: c.id, label: c.name })),
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
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" form="filtry" className="w-full">
              Pokaż wyniki
            </Button>
            <a href="/biblioteka" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              Wyczyść filtry
            </a>
          </CardFooter>
        </Card>

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold">Wyniki</h2>
            <p role="status" aria-live="polite" className="text-muted-foreground">
              Liczba znalezionych innowacji: {results.length}
            </p>
          </div>

          {active.length > 0 && (
            <ul aria-label="Aktywne filtry" className="flex flex-wrap gap-2">
              {active.map((key) => (
                <li key={key}>
                  <a
                    href={without(key)}
                    aria-label={`Usuń filtr ${labels[key]}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    {labels[key]}
                    <XIcon data-icon="inline-end" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {results.length ? (
            <ul className="grid gap-6 md:grid-cols-2">
              {results.map((solution) => (
                <li key={solution.id}>
                  <InnovationCard solution={solution} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Brak innowacji dla tych filtrów"
              description="Usuń któryś filtr albo wyczyść wszystkie, żeby zobaczyć więcej innowacji."
            >
              <a href="/biblioteka" className={buttonVariants({ variant: "secondary" })}>
                Wyczyść filtry
              </a>
            </EmptyState>
          )}
        </section>
      </div>
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
      <Select id={id} name={id} form="filtry" items={items} defaultValue={value || null}>
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
