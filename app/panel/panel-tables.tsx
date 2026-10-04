"use client"

import { useTransition } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { StageBadge } from "@/components/stage-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { STAGES } from "@/seed"
import { approveSolutionAction } from "@/app/actions/rops-panel-actions"

import { formatDate } from "./format"
import { PreviewSheet, type DraftInnovation } from "./preview-sheet"

export type Call = {
  title: string
  /** ISO, np. 2026-11-30 */
  deadline: string
  applications: number
  open: boolean
}

function PublishButton({ item }: { item: DraftInnovation }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    if (!item.id) return
    startTransition(async () => {
      try {
        await approveSolutionAction(item.id!)
      } catch (err: unknown) {
        alert((err as Error).message || "Błąd zatwierdzania innowacji")
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
        <span className="text-sm text-muted-foreground">{item.organization}</span>
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
    cell: (item) => <span className="text-muted-foreground">{item.source}</span>,
  },
  {
    id: "date",
    header: "Dodano",
    className: "hidden md:table-cell",
    sortValue: (item) => item.date,
    cell: (item) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(item.date)}</span>,
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
    cell: (call) => <span className="whitespace-nowrap text-muted-foreground">do {formatDate(call.deadline)}</span>,
  },
  {
    id: "applications",
    header: "Wnioski",
    className: "hidden md:table-cell",
    sortValue: (call) => call.applications,
    cell: (call) => call.applications,
  },
  {
    id: "status",
    header: "Status",
    sortValue: (call) => (call.open ? 0 : 1),
    cell: (call) => <Badge variant={call.open ? "default" : "outline"}>{call.open ? "Otwarty" : "Zamknięty"}</Badge>,
  },
  {
    id: "actions",
    header: "Akcje",
    srOnlyHeader: true,
    className: "text-right",
    cell: (call) => (
      <Button type="button" size="sm" variant="outline">
        Wnioski<span className="sr-only">: {call.title}</span>
      </Button>
    ),
  },
]

export function CallsTable({ calls }: { calls: Call[] }) {
  return (
    <DataTable
      rows={calls}
      columns={callColumns}
      getRowId={(call) => call.title}
      caption="Nabory"
      initialSort={{ id: "deadline", dir: "desc" }}
    />
  )
}