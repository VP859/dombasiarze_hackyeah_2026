import type { Metadata } from "next"

import { IdeaWizard } from "@/components/idea-wizard"

export const metadata: Metadata = {
  title: "Zgłoś rozwiązanie",
  description: "Opisz swój pomysł na innowację społeczną. Asystent AI przygotuje kanwę i sprawdzi bibliotekę.",
}

export default function KreatorPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Kreator pomysłów</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">Masz pomysł? Opisz go</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Asystent AI sprawdzi, czy podobne rozwiązanie już działa, i ułoży Twój pomysł w kanwę innowacji
          ROPS.
        </p>
      </div>

      <IdeaWizard />
    </div>
  )
}
