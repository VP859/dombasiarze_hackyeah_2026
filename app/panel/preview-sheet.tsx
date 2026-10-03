"use client"

import { CheckIcon } from "lucide-react"

import { StageBadge } from "@/components/stage-badge"
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
import type { Stage } from "@/seed"

export type DraftInnovation = {
  title: string
  organization: string
  stage: Stage
  source: string
  date: string
  audience: string
  problem: string
  method: string
  effects: string[]
  resources: string[]
}

// Podgląd zgłoszonej innowacji w panelu bocznym — ROPS czyta całość bez wychodzenia z listy.
export function PreviewSheet({ item }: { item: DraftInnovation }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" size="sm" variant="outline" />}>
        Podgląd<span className="sr-only">: {item.title}</span>
      </SheetTrigger>
      <SheetContent className="w-full! sm:max-w-xl!">
        <SheetHeader className="pr-16">
          <StageBadge stage={item.stage} />
          <SheetTitle className="text-2xl font-bold">{item.title}</SheetTitle>
          <SheetDescription>{item.organization}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pb-6 text-base">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Dla kogo</dt>
              <dd className="font-medium">{item.audience}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Źródło</dt>
              <dd className="font-medium">{item.source}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Dodano</dt>
              <dd className="font-medium">{item.date}</dd>
            </div>
          </dl>

          <section className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Problem</h3>
            <p>{item.problem}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Rozwiązanie</h3>
            <p>{item.method}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold">Efekty</h3>
            <ul className="flex flex-col gap-2">
              {item.effects.map((effect) => (
                <li key={effect} className="flex gap-3">
                  <CheckIcon aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
                  {effect}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold">Potrzebne zasoby</h3>
            <ul className="flex list-disc flex-col gap-2 pl-6">
              {item.resources.map((resource) => (
                <li key={resource}>{resource}</li>
              ))}
            </ul>
          </section>
        </div>

        <SheetFooter className="border-t">
          <SheetClose render={<Button type="button" variant="outline" />}>Zamknij</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
