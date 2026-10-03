import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Wspólne klocki paneli bocznych w Panelu ROPS: krótkie fakty, ramki z ikoną i etykiety zamiast długich list.

export function Facts({ items }: { items: { icon: LucideIcon; label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-4 rounded-2xl bg-muted p-4 sm:grid-cols-2">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex flex-col gap-1">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Block({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: LucideIcon
  title: string
  accent?: boolean
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl border p-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Icon aria-hidden className={cn("size-5 shrink-0", accent ? "text-primary" : "text-muted-foreground")} />
        {title}
      </h3>
      <div className="leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function Chips({ items, empty = "Nie podano" }: { items: string[]; empty?: string }) {
  if (!items.length) return <p className="text-muted-foreground">{empty}</p>
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <Badge variant="secondary" className="h-auto py-1 text-left whitespace-normal">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>
}
