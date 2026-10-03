import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, CheckIcon, CircleAlertIcon, LightbulbIcon } from "lucide-react"

import { RatingStars } from "@/components/rating-stars"
import { StageBadge } from "@/components/stage-badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getChallenges, getRating, getReviews, getSolution } from "@/seed"

// ponytail: dzielenie tekstu z seeda na punkty; gdy backend da tablice, użyć ich wprost.
const sentences = (text: string) => text.split(/(?<=\.)\s+/).map((s) => s.replace(/\.$/, ""))
const items = (text: string) => text.replace(/\.$/, "").split(/,\s*/)

export async function generateMetadata({ params }: PageProps<"/innowacja/[id]">): Promise<Metadata> {
  const { id } = await params
  return { title: getSolution(id)?.title ?? "Nie znaleziono innowacji" }
}

export default async function Page({ params }: PageProps<"/innowacja/[id]">) {
  const { id } = await params
  const solution = getSolution(id)
  if (!solution) notFound()

  const rating = getRating(id)
  const reviews = getReviews(id)
  const challenges = getChallenges().filter((c) => solution.challenge_ids.includes(c.id))

  return (
    <article className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Link href="/biblioteka" className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          Wróć do biblioteki
        </Link>
        <h1 className="max-w-3xl text-4xl font-bold text-balance md:text-5xl">{solution.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <StageBadge stage={solution.stage} />
          <span className="text-muted-foreground">{solution.organization}</span>
        </div>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_20rem]">
        {/* Najpierw w DOM: na telefonie fakty i przyciski są od razu pod tytułem. */}
        <aside className="flex flex-col gap-6 rounded-4xl bg-muted p-6 lg:sticky lg:top-24 lg:order-last">
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Dla kogo</dt>
              <dd className="font-medium">{solution.audience}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Wyzwania</dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1 font-medium">
                {challenges.map((c) => (
                  <Link key={c.id} href={`/biblioteka?challenge=${c.id}`} className="underline underline-offset-4">
                    {c.name}
                  </Link>
                ))}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Ocena</dt>
              <dd>
                <RatingStars value={rating.average} count={rating.count} />
              </dd>
            </div>
          </dl>
          <div className="flex flex-col gap-3">
            <Link href={`/innowacja/${solution.id}/gmina`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Dostosuj do mojej gminy
            </Link>
            <Link
              href={`/test/${solution.id}`}
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full")}
            >
              Zgłoś się do testu
            </Link>
          </div>
        </aside>

        <div className="flex flex-col gap-12">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CircleAlertIcon aria-hidden className="size-6 text-muted-foreground" />
                  <h2>Problem</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{solution.problem}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LightbulbIcon aria-hidden className="size-6 text-primary" />
                  <h2>Rozwiązanie</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{solution.method}</p>
              </CardContent>
            </Card>
          </div>

          {solution.video_url && (
            <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-4xl bg-muted">
              <iframe
                src={solution.video_url}
                title={`Film: ${solution.title}`}
                className="size-full"
                loading="lazy"
                allowFullScreen
              />
            </AspectRatio>
          )}

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Efekty</h2>
            <ul className="flex flex-col gap-3">
              {sentences(solution.effect).map((effect) => (
                <li key={effect} className="flex gap-3">
                  <CheckIcon aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
                  {effect}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Potrzebne zasoby</h2>
            <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
              {items(solution.resources).map((resource) => (
                <li key={resource} className="flex gap-3 border-b pb-3">
                  <span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-foreground" />
                  <span className="first-letter:uppercase">{resource}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Oceny i opinie</h2>
            <RatingStars value={rating.average} count={rating.count} />
            {reviews.length > 0 && (
              <ul className="divide-y border-y">
                {reviews.map((review, i) => (
                  <li key={i} className="flex max-w-[65ch] flex-col gap-2 py-4">
                    <RatingStars value={review.rating} />
                    <p>{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            {/* F2: tu wstawi <Reviews solutionId={id} /> */}
          </section>
        </div>
      </div>
    </article>
  )
}
