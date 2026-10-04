"use client"

import { useState, useTransition } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { StageBadge } from "@/components/stage-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { STAGES } from "@/seed"
import { approveSolutionAction } from "@/app/actions/rops-panel-actions"
import {
  toggleCallStatusAction,
  getApplicationsForCall,
  setApplicationStatusAction,
  type CallDb,
  type ApplicationDb,
  type ApplicationStatus,
} from "@/app/actions/calls-actions"

import { formatDate } from "./format"
import { PreviewSheet, type DraftInnovation } from "./preview-sheet"

export type Call = CallDb

function CallStatusBadge({ call }: { call: Call }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleCallStatusAction(call.id, call.open)
      } catch (err: unknown) {
        alert(
          (err as { message: string }).message || "Błąd zmiany statusu naboru"
        )
      }
    })
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className="cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      <Badge variant={call.open ? "default" : "outline"}>
        {isPending ? "..." : call.open ? "Otwarty" : "Zamknięty"}
      </Badge>
    </button>
  )
}

const STATUS_BADGE: Record<ApplicationStatus, { label: string; variant: "default" | "outline" | "destructive" }> = {
  submitted: { label: "Do oceny", variant: "outline" },
  approved: { label: "Zatwierdzony", variant: "default" },
  rejected: { label: "Odrzucony", variant: "destructive" },
}

// Decyzja ROPS o wniosku: zatwierdź albo odrzuć. Wynik ogłaszany czytnikom ekranu.
function ApplicationReview({
  app,
  onChange,
}: {
  app: ApplicationDb
  onChange: (status: ApplicationStatus) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  const decide = (status: ApplicationStatus) =>
    startTransition(async () => {
      const result = await setApplicationStatusAction(app.id, status)
      if (result.ok) {
        onChange(status)
        setMessage(status === "approved" ? "Wniosek zatwierdzony." : "Wniosek odrzucony.")
      } else {
        setMessage(result.error)
      }
    })

  return (
    <div className="flex flex-col gap-2 border-t pt-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={isPending || app.status === "approved"} onClick={() => decide("approved")}>
          Zatwierdź<span className="sr-only">: {app.ideaTitle}</span>
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={isPending || app.status === "rejected"} onClick={() => decide("rejected")}>
          Odrzuć<span className="sr-only">: {app.ideaTitle}</span>
        </Button>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {isPending ? "Zapisuję decyzję…" : message}
      </p>
    </div>
  )
}

function ApplicationsSheet({ call }: { call: Call }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<ApplicationDb[]>([])

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setLoading(true)
      try {
        const data = await getApplicationsForCall(call.id)
        setApplications(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger render={
        <Button type="button" size="sm" variant="outline">
          Wnioski ({call.applicationsCount})<span className="sr-only">: {call.title}</span>
        </Button>
      } />
      <SheetContent className="w-full! sm:max-w-xl!">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Wnioski w naborze: {call.title}</SheetTitle>
          <SheetDescription>Liczba wniosków w bazie: {applications.length}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Ładowanie wniosków...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Brak zapisanych wniosków dla tego naboru w tabeli applications.</p>
          ) : (
            applications.map((app) => {
              const content = app.content as {
                executive_summary?: string
                summary?: string
                budget_breakdown?: unknown
              } | null
              const summary = content?.executive_summary || content?.summary || "Brak opisu wniosku."
              const budget = content?.budget_breakdown

              return (
                <div key={app.id} className="rounded-lg border p-4 space-y-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-primary">{app.ideaTitle}</h3>
                    {app.status && (
                      <Badge variant={STATUS_BADGE[app.status].variant} className="shrink-0">
                        {STATUS_BADGE[app.status].label}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">Autor: {app.authorEmail}</p>

                  <div className="text-sm space-y-1 border-t pt-2">
                    <span className="font-semibold text-xs text-muted-foreground uppercase">Streszczenie:</span>
                    <p className="leading-relaxed">{summary}</p>
                  </div>

                  {Array.isArray(budget) && budget.length > 0 && (
                    <div className="text-xs border-t pt-2 space-y-1">
                      <span className="font-semibold text-muted-foreground uppercase">Kosztorys:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {budget.map((entry: unknown, idx: number) => {
                          const b = entry && typeof entry === "object"
                            ? entry as Record<string, unknown>
                            : {}
                          const estimatedCost = b.estimated_cost_pln

                          return (
                            <li key={idx}>
                              {String(b.item ?? "")}: <strong>{typeof estimatedCost === "number" ? estimatedCost.toLocaleString("pl-PL") : "—"} PLN</strong>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  <ApplicationReview
                    app={app}
                    onChange={(status) =>
                      setApplications((list) => list.map((a) => (a.id === app.id ? { ...a, status } : a)))
                    }
                  />
                </div>
              )
            })
          )}
        </div>

        <SheetFooter className="border-t pt-4">
          <SheetClose render={<Button type="button" variant="outline">Zamknij</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function PublishButton({ item }: { item: DraftInnovation }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    if (!item.id) return
    startTransition(async () => {
      try {
        await approveSolutionAction(item.id!)
      } catch (err: unknown) {
        alert(
          (err as { message: string }).message || "Błąd zatwierdzania innowacji"
        )
      }
    })
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={handleApprove}
    >
      {isPending ? "Zatwierdzanie..." : "Opublikuj"}
      <span className="sr-only">: {item.title}</span>
    </Button>
  )
}

const verifyColumns: Column<DraftInnovation>[] = [
  {
    id: "title",
    header: "Innowacja",
    sortValue: (item) => item.title,
    cell: (item) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{item.title}</span>
        <span className="text-sm text-muted-foreground">
          {item.organization}
        </span>
      </div>
    ),
  },
  {
    id: "stage",
    header: "Etap",
    sortValue: (item) => STAGES.indexOf(item.stage),
    cell: (item) => <StageBadge stage={item.stage} />,
  },
  {
    id: "source",
    header: "Źródło",
    className: "hidden lg:table-cell",
    sortValue: (item) => item.source,
    cell: (item) => (
      <span className="text-muted-foreground">{item.source}</span>
    ),
  },
  {
    id: "date",
    header: "Dodano",
    className: "hidden md:table-cell",
    sortValue: (item) => item.date,
    cell: (item) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDate(item.date)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Akcje",
    srOnlyHeader: true,
    className: "w-px whitespace-nowrap",
    cell: (item) => (
      <div className="flex justify-end gap-2">
        <PreviewSheet item={item} />
        <PublishButton item={item} />
      </div>
    ),
  },
]

export function VerifyTable({ items }: { items: DraftInnovation[] }) {
  return (
    <DataTable
      rows={items}
      columns={verifyColumns}
      getRowId={(item) => item.id || item.title}
      caption="Innowacje do weryfikacji"
      initialSort={{ id: "date", dir: "desc" }}
    />
  )
}

const callColumns: Column<Call>[] = [
  {
    id: "title",
    header: "Nabór",
    sortValue: (call) => call.title,
    cell: (call) => <span className="font-medium">{call.title}</span>,
  },
  {
    id: "deadline",
    header: "Termin",
    className: "hidden md:table-cell",
    sortValue: (call) => call.deadline,
    cell: (call) => (
      <span className="whitespace-nowrap text-muted-foreground">
        do {formatDate(call.deadline)}
      </span>
    ),
  },
  {
    id: "applications",
    header: "Wnioski",
    className: "hidden md:table-cell",
    sortValue: (call) => call.applicationsCount,
    cell: (call) => call.applicationsCount,
  },
  {
    id: "status",
    header: "Status",
    sortValue: (call) => (call.open ? 0 : 1),
    cell: (call) => <CallStatusBadge call={call} />,
  },
  {
    id: "actions",
    header: "Akcje",
    srOnlyHeader: true,
    className: "text-right",
    cell: (call) => <ApplicationsSheet call={call} />,
  },
]

export function CallsTable({ calls }: { calls: Call[] }) {
  return (
    <DataTable
      rows={calls}
      columns={callColumns}
      getRowId={(call) => call.id || call.title}
      caption="Nabory"
      initialSort={{ id: "deadline", dir: "desc" }}
    />
  )
}
