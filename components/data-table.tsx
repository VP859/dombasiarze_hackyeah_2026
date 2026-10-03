"use client"

import { useState, type ReactNode } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type Column<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  /** Podana = kolumnę można sortować kliknięciem w nagłówek. */
  sortValue?: (row: T) => string | number
  /** Klasy dla nagłówka i komórek, np. „hidden md:table-cell”. */
  className?: string
  /** Nagłówek tylko dla czytnika ekranu (np. kolumna z przyciskami). */
  srOnlyHeader?: boolean
}

type Sort = { id: string; dir: "asc" | "desc" }

// ponytail: sortowanie i strony w przeglądarce; przy tysiącach wierszy przenieść na serwer (zapytanie do bazy).
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  pageSize = 5,
  initialSort,
}: {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  caption: string
  pageSize?: number
  initialSort?: Sort
}) {
  const [sort, setSort] = useState<Sort | null>(initialSort ?? null)
  const [page, setPage] = useState(0)

  const sortColumn = columns.find((c) => c.id === sort?.id)
  const sorted = sortColumn?.sortValue
    ? [...rows].sort((a, b) => {
        const x = sortColumn.sortValue!(a)
        const y = sortColumn.sortValue!(b)
        const order =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y), "pl")
        return sort!.dir === "asc" ? order : -order
      })
    : rows

  // Po zmianie filtrów strona może wypaść poza zakres — wtedy pokazujemy ostatnią.
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pageCount - 1)
  const visible = sorted.slice(
    current * pageSize,
    current * pageSize + pageSize
  )
  const from = sorted.length ? current * pageSize + 1 : 0
  const to = current * pageSize + visible.length

  // Nowe sortowanie = wracamy na pierwszą stronę.
  const toggleSort = (id: string) => {
    setSort((prev) =>
      prev?.id === id
        ? { id, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { id, dir: "asc" }
    )
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => {
                const active = sort?.id === column.id
                const SortIcon = !active
                  ? ArrowUpDownIcon
                  : sort.dir === "asc"
                    ? ArrowUpIcon
                    : ArrowDownIcon
                return (
                  <TableHead
                    key={column.id}
                    className={cn(
                      "h-12 px-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase",
                      column.className
                    )}
                    aria-sort={
                      column.sortValue
                        ? active
                          ? sort.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                  >
                    {column.srOnlyHeader ? (
                      <span className="sr-only">{column.header}</span>
                    ) : column.sortValue ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-ml-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase hover:text-foreground"
                        onClick={() => toggleSort(column.id)}
                      >
                        {column.header}
                        <SortIcon
                          data-icon="inline-end"
                          aria-hidden
                          className={cn(!active && "opacity-50")}
                        />
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      "px-4 py-4 whitespace-normal",
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground" aria-live="polite">
          Wiersze {from}–{to} z {sorted.length}
        </p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeftIcon data-icon="inline-start" aria-hidden />
              Poprzednia
            </Button>
            <span className="text-muted-foreground">
              Strona {current + 1} z {pageCount}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              Następna
              <ChevronRightIcon data-icon="inline-end" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
