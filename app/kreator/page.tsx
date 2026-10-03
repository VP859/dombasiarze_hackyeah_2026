import type { Metadata } from "next"

import { CreatorForm } from "./creator-form"

export const metadata: Metadata = {
  title: "Nowy pomysł",
  description: "Opisz swój pomysł na innowację społeczną.",
}

export default function CreatorPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
          Kreator innowacji
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
          Opisz swój pomysł
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Zacznij od krótkiej fiszki. Później asystent pomoże Ci rozwinąć pomysł.
        </p>
      </header>

      <CreatorForm />
    </article>
  )
}
