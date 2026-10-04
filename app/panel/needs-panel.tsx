"use client"

import { useState, useTransition } from "react"
import { CalendarIcon, CircleAlertIcon, LightbulbIcon, MailIcon, UserIcon } from "lucide-react"

import { DataTable, type Column } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { REPORT_AUDIENCES, REPORT_ROLES, type Challenge, type ReportRole } from "@/seed"
import { updateNeedStatusAction } from "@/app/actions/needs-actions"

import { formatDate, innowacje } from "./format"
import { Block, Chips, Facts, SectionTitle } from "./sheet-parts"

export type NeedStatus = "Nowe" | "W toku" | "Zamknięte"

export type Need = {
  id: string
  gmina: string
  text: string
  role: ReportRole
  challenges: string[]
  audiences: string[]
  status: NeedStatus
  matches: number
  /** ISO, np. 2026-10-03 */
  date: string
  email: string
}

const STATUSES: NeedStatus[] = ["Nowe", "W toku", "Zamknięte"]

const roleLabel = (role: ReportRole) => REPORT_ROLES.find((r) => r.value === role)?.label ?? role

type Option = { value: string | null; label: string }

function StatusSelector({ need }: { need: Need }) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState<NeedStatus>(need.status)

  const handleStatusChange = (nextStatus: string | null) => {
    if (!nextStatus) return
    const newStatus = nextStatus as NeedStatus
    setCurrentStatus(newStatus)

    startTransition(async () => {
      try {
        await updateNeedStatusAction(need.id, newStatus)
      } catch (err: unknown) {
        alert((err as Error).message || "Błąd zmiany statusu")
        setCurrentStatus(need.status)
      }
    })
  }

  return (
    <div className="w-32">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger
          className={`h-8 text-xs ${
            currentStatus === "Nowe"
              ? "border-green-300 bg-green-400 text-black font-bold"
              : currentStatus === "Zamknięte"
                ? "border-red-300 bg-red-400 text-red-900 font-bold"
                : ""
          }`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export function NeedsPanel({ needs, challenges }: { needs: Need[]; challenges: Challenge[] }) {
  const [q, setQ] = useState("")
  const [challenge, setChallenge] = useState<string | null>(null)
  const [audience, setAudience] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const challengeName = (id: string) => challenges.find((c) => c.id === id)?.name ?? id
  const query = q.trim().toLocaleLowerCase("pl")
  const filtered = needs.filter(
    (n) =>
      (!query || `${n.gmina} ${n.text}`.toLocaleLowerCase("pl").includes(query)) &&
      (!challenge || n.challenges.includes(challenge)) &&
      (!audience || n.audiences.includes(audience)) &&
      (!role || n.role === role) &&
      (!status || n.status === status)
  )
  const hasFilters = Boolean(query || challenge || audience || role || status)
  
  const byCount = challenges
    .map((c) => ({ challenge: c, count: needs.filter((n) => n.challenges.includes(c.id)).length }))
    .sort((a, b) => b.count - a.count || a.challenge.name.localeCompare(b.challenge.name, "pl"))

  const columns: Column<Need>[] = [
    {
      id: "gmina",
      header: "Gmina i problem",
      sortValue: (n) => n.gmina,
      cell: (n) => (
        <div className="flex flex-col gap-2">
          <span className="font-medium">{n.gmina}</span>
          <span className="text-sm text-muted-foreground">{n.text}</span>
          <div className="flex flex-wrap gap-1">
            {n.challenges.map((id) => (
              <Badge key={id} variant="outline">
                {challengeName(id)}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Kto zgłosił",
      className: "hidden lg:table-cell",
      sortValue: (n) => roleLabel(n.role),
      cell: (n) => <span className="text-muted-foreground">{roleLabel(n.role)}</span>,
    },
    {
      id: "matches",
      header: "Dopasowania",
      className: "hidden md:table-cell",
      sortValue: (n) => n.matches,
      cell: (n) => <span className="whitespace-nowrap text-muted-foreground">{innowacje(n.matches)}</span>,
    },
    {
      id: "date",
      header: "Wpłynęło",
      className: "hidden md:table-cell",
      sortValue: (n) => n.date,
      cell: (n) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(n.date)}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (n) => STATUSES.indexOf(n.status),
      cell: (n) => <StatusSelector need={n} />,
    },
    {
      id: "actions",
      header: "Akcje",
      srOnlyHeader: true,
      className: "text-right",
      cell: (n) => <NeedSheet need={n} challengeName={challengeName} />,
    },
  ]

  const clear = () => {
    setQ("")
    setChallenge(null)
    setAudience(null)
    setRole(null)
    setStatus(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="by-challenge" className="flex flex-col gap-3">
        <h3 id="by-challenge" className="text-lg font-semibold">
          Zgłoszenia według wyzwań
        </h3>
        <p className="text-muted-foreground">Kliknij wyzwanie, żeby pokazać tylko jego zgłoszenia.</p>
        <div className="flex flex-wrap gap-2">
          {byCount.map(({ challenge: c, count }) => {
            const active = challenge === c.id
            return (
              <Button
                key={c.id}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => setChallenge(active ? null : c.id)}
              >
                {c.name}
                <Badge variant="secondary">{count}</Badge>
              </Button>
            )
          })}
        </div>
      </section>

      <FieldGroup className="gap-4 md:grid md:grid-cols-2 xl:grid-cols-5">
        <Field>
          <FieldLabel htmlFor="needs-q">Szukaj</FieldLabel>
          <Input
            id="needs-q"
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Gmina lub słowo"
          />
        </Field>
        <FilterSelect
          id="needs-challenge"
          label="Wyzwanie"
          value={challenge}
          onChange={setChallenge}
          items={[{ value: null, label: "Wszystkie" }, ...challenges.map((c) => ({ value: c.id, label: c.name }))]}
        />
        <FilterSelect
          id="needs-audience"
          label="Kogo dotyczy"
          value={audience}
          onChange={setAudience}
          items={[{ value: null, label: "Wszyscy" }, ...REPORT_AUDIENCES.map((a) => ({ value: a, label: a }))]}
        />
        <FilterSelect
          id="needs-role"
          label="Kto zgłosił"
          value={role}
          onChange={setRole}
          items={[{ value: null, label: "Wszyscy" }, ...REPORT_ROLES.map((r) => ({ value: r.value, label: r.label }))]}
        />
        <FilterSelect
          id="needs-status"
          label="Status"
          value={status}
          onChange={setStatus}
          items={[{ value: null, label: "Każdy" }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
        />
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-muted-foreground">
          Pokazano {filtered.length} z {needs.length} zgłoszeń
        </p>
        {hasFilters && (
          <Button type="button" size="sm" variant="outline" onClick={clear}>
            Wyczyść filtry
          </Button>
        )}
      </div>

      {filtered.length ? (
        <DataTable
          rows={filtered}
          columns={columns}
          getRowId={(n) => n.id}
          caption="Zgłoszenia potrzeb"
          initialSort={{ id: "date", dir: "desc" }}
        />
      ) : (
        <EmptyState title="Brak zgłoszeń dla tych filtrów" description="Zmień albo wyczyść filtry.">
          <Button type="button" variant="outline" onClick={clear}>
            Wyczyść filtry
          </Button>
        </EmptyState>
      )}
    </div>
  )
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  items,
}: {
  id: string
  label: string
  value: string | null
  onChange: (value: string | null) => void
  items: Option[]
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select id={id} items={items} value={value} onValueChange={(next) => onChange((next as string | null) ?? null)}>
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

function NeedSheet({ need, challengeName }: { need: Need; challengeName: (id: string) => string }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" size="sm" variant="outline" />}>
        Szczegóły<span className="sr-only">: {need.gmina}</span>
      </SheetTrigger>
      <SheetContent className="w-full! sm:max-w-xl!">
        <SheetHeader className="pr-16">
          <div className="pt-2">
            <StatusSelector need={need} />
          </div>
          <SheetTitle className="text-2xl leading-tight font-bold">Zgłoszenie: {need.gmina}</SheetTitle>
          <SheetDescription>Wpłynęło {formatDate(need.date)}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 text-base">
          <Facts
            items={[
              { icon: UserIcon, label: "Kto zgłosił", value: roleLabel(need.role) },
              { icon: CalendarIcon, label: "Wpłynęło", value: formatDate(need.date) },
              { icon: LightbulbIcon, label: "Dopasowane innowacje", value: innowacje(need.matches) },
              {
                icon: MailIcon,
                label: "Kontakt",
                value: (
                  <a href={`mailto:${need.email}`} className="break-all underline underline-offset-4">
                    {need.email}
                  </a>
                ),
              },
            ]}
          />

          <Block icon={CircleAlertIcon} title="Opis problemu">
            <p>{need.text}</p>
          </Block>

          <section className="flex flex-col gap-3">
            <SectionTitle>Czego dotyczy</SectionTitle>
            <Chips items={need.challenges.map(challengeName)} />
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>Kogo dotyczy</SectionTitle>
            <Chips items={need.audiences} />
          </section>
        </div>

        <SheetFooter className="border-t">
          <SheetClose render={<Button type="button" variant="outline" />}>Zamknij</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}