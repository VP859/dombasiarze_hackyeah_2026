import Link from "next/link"

import { InnovationCard } from "@/components/innovation-card"
import { RegionMap } from "@/components/region-map"
import { buttonVariants } from "@/components/ui/button"
import { getReviewsForSolution, getSolutions } from "@/app/actions/solutions"
import { getChallenges } from "@/seed"

const STEPS = [
  { title: "Zgłoś", text: "Opisz problem w swojej okolicy. Wystarczy kilka zdań." },
  { title: "Dopasuj", text: "Pokażemy innowacje, które rozwiązały podobny problem gdzie indziej." },
  { title: "Wdróż w gminie", text: "Dostosuj wybrane rozwiązanie do swojej gminy i zacznij działać." },
]

// Dane z Supabase, strona odświeżana co minutę.
export const revalidate = 60

export default async function Page() {
  const solutions = (await getSolutions().catch(() => null)) ?? []
  const proven = solutions.filter((s) => s.stage === "sprawdzona")
  // Najpierw sprawdzone, resztą dopełniamy do trzech.
  const featured = [...proven, ...solutions.filter((s) => s.stage !== "sprawdzona")].slice(0, 3)
  // ponytail: jedno zapytanie o oceny na innowację; przy dużej bazie pobrać liczniki jednym zapytaniem.
  const ratings = await Promise.all(
    solutions.map((s) =>
      getReviewsForSolution(s.id)
        .then((reviews) => ({
          count: reviews.length,
          average: reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1),
        }))
        .catch(() => ({ count: 0, average: 0 }))
    )
  )
  const ratingOf = (id: string) => ratings[solutions.findIndex((s) => s.id === id)]
  const stats = [
    { label: "Innowacje w bibliotece", value: solutions.length },
    { label: "Wyzwania społeczne", value: getChallenges().length },
    { label: "Sprawdzone w praktyce", value: proven.length },
    { label: "Opinie użytkowników", value: ratings.reduce((n, r) => n + r.count, 0) },
  ]

  return (
    <div className="flex flex-col gap-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="font-medium text-muted-foreground">Małopolski Hub Innowacji Społecznych</p>
          <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance md:text-6xl">
            Nie wymyślaj koła na nowo — podaj dalej
          </h1>
          <p className="max-w-xl text-xl text-muted-foreground">
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
        </div>
        <figure className="flex flex-col gap-3">
          <RegionMap className="mx-auto w-full max-w-lg" />
          <figcaption className="text-center text-muted-foreground">
            Pomysł sprawdzony w jednej gminie przechodzi do kolejnych.
          </figcaption>
        </figure>
      </section>

      <dl className="grid grid-cols-2 gap-6 border-y py-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1">
            <dt className="text-muted-foreground">{stat.label}</dt>
            <dd className="font-heading text-4xl font-semibold tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>

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
              <InnovationCard solution={solution} rating={ratingOf(solution.id)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
