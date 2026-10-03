"use client"

import { CalendarIcon, CheckIcon, CircleAlertIcon, InboxIcon, LightbulbIcon, UsersIcon } from "lucide-react"

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

import { formatDate } from "./format"
import { Block, Chips, Facts, SectionTitle } from "./sheet-parts"

export type DraftInnovation = {
  title: string
  organization: string
  stage: Stage
  source: string
  /** ISO, np. 2026-10-03 */
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
          <SheetTitle className="text-2xl leading-tight font-bold">{item.title}</SheetTitle>
          <SheetDescription>{item.organization}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 text-base">
          <Facts
            items={[
              { icon: UsersIcon, label: "Dla kogo", value: item.audience },
              { icon: InboxIcon, label: "Źródło", value: item.source },
              { icon: CalendarIcon, label: "Dodano", value: formatDate(item.date) },
            ]}
          />

          <Block icon={CircleAlertIcon} title="Problem">
            <p>{item.problem}</p>
          </Block>

          <Block icon={LightbulbIcon} title="Rozwiązanie" accent>
            <p>{item.method}</p>
          </Block>

          <section className="flex flex-col gap-3">
            <SectionTitle>Efekty</SectionTitle>
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
            <SectionTitle>Potrzebne zasoby</SectionTitle>
            <Chips items={item.resources} />
          </section>
        </div>

        <SheetFooter className="border-t">
          <SheetClose render={<Button type="button" variant="outline" />}>Zamknij</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
