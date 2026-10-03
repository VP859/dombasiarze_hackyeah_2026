import type { Metadata } from "next"
import Link from "next/link"
import { icons } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getChallenges, getSolutions } from "@/seed"

export const metadata: Metadata = { title: "Wyzwania" }

// Kolor kwadratu z ikoną dla każdego wyzwania. Biała ikona ma na każdym kontrast ≥ 4,5:1.
const COLORS: Record<string, string> = {
  starzenie: "bg-amber-700",
  "zdrowie-psychiczne": "bg-violet-600",
  samotnosc: "bg-rose-600",
  "wykluczenie-cyfrowe": "bg-sky-700",
  "dostep-do-uslug": "bg-teal-700",
  koordynacja: "bg-indigo-600",
  "zmiany-osadnicze": "bg-orange-700",
}

export default function Page() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">Wyzwania społeczne</h1>
        <p className="max-w-2xl text-muted-foreground">
          Najważniejsze problemy, z którymi mierzą się gminy w Małopolsce. Wybierz wyzwanie i zobacz
          pasujące innowacje.
        </p>
      </div>
      <ul className="divide-y border-y">
        {getChallenges().map((challenge) => {
          const Icon = icons[challenge.icon as keyof typeof icons] ?? icons.Lightbulb
          const count = getSolutions({ challenge: challenge.id }).length
          return (
            <li
              key={challenge.id}
              className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex gap-4">
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl text-white",
                    COLORS[challenge.id] ?? "bg-primary"
                  )}
                >
                  <Icon aria-hidden className="size-6" />
                </span>
                <div className="flex max-w-2xl flex-col gap-1">
                  <h2 className="text-xl font-semibold">{challenge.name}</h2>
                  <p className="text-muted-foreground">{challenge.summary}</p>
                </div>
              </div>
              <Link
                href={`/biblioteka?challenge=${challenge.id}`}
                className={cn(buttonVariants({ variant: "secondary" }), "shrink-0 self-start md:self-center")}
              >
                Zobacz innowacje ({count})<span className="sr-only">: {challenge.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
