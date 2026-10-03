import Link from "next/link"

import { InnovationCard } from "@/components/innovation-card"
import { buttonVariants } from "@/components/ui/button"
import { getSolutions } from "@/seed"

const STEPS = [
  { title: "Zgłoś", text: "Opisz problem w swojej okolicy. Wystarczy kilka zdań." },
  { title: "Dopasuj", text: "Pokażemy innowacje, które rozwiązały podobny problem gdzie indziej." },
  { title: "Wdróż w gminie", text: "Dostosuj wybrane rozwiązanie do swojej gminy i zacznij działać." },
]

export default function Page() {
  const featured = getSolutions({ stage: "sprawdzona" }).slice(0, 3)

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6 py-6">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-5xl">
          Nie wymyślaj koła na nowo — podaj dalej
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Znajdź sprawdzone innowacje społeczne z Małopolski i wdróż je w swojej gminie.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/zglos" className={buttonVariants({ size: "lg" })}>
            Zgłoś problem
          </Link>
          <Link href="/biblioteka" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            Przeglądaj innowacje
          </Link>
          <Link href="/kreator" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            Mam pomysł
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold">Jak to działa</h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2 border-t pt-4">
              <span aria-hidden className="text-muted-foreground">
                Krok {i + 1}
              </span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-3xl font-bold">Wyróżnione innowacje</h2>
          <Link href="/biblioteka" className="underline underline-offset-4">
            Zobacz wszystkie innowacje
          </Link>
        </div>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((solution) => (
            <li key={solution.id}>
              <InnovationCard solution={solution} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
