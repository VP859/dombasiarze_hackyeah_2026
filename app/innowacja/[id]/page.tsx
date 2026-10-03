import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { RatingStars } from "@/components/rating-stars"
import { StageBadge } from "@/components/stage-badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { buttonVariants } from "@/components/ui/button"
import { getChallenges, getRating, getReviews, getSolution } from "@/seed"

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
  const sections = [
    { title: "Problem", text: solution.problem },
    { title: "Rozwiązanie", text: solution.method },
    { title: "Efekty", text: solution.effect },
    { title: "Potrzebne zasoby", text: solution.resources },
  ]

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Link href="/biblioteka" className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          Wróć do biblioteki
        </Link>
        <h1 className="text-4xl font-bold">{solution.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <StageBadge stage={solution.stage} />
          <span className="text-muted-foreground">{solution.organization}</span>
        </div>
        <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
          <dt className="font-medium">Dla kogo:</dt>
          <dd>{solution.audience}</dd>
          <dt className="font-medium">Wyzwania:</dt>
          <dd className="flex flex-wrap gap-x-3">
            {challenges.map((c) => (
              <Link key={c.id} href={`/biblioteka?challenge=${c.id}`} className="underline underline-offset-4">
                {c.name}
              </Link>
            ))}
          </dd>
        </dl>
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

      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{section.title}</h2>
          <p>{section.text}</p>
        </section>
      ))}

      <div className="flex flex-wrap gap-3">
        <Link href={`/innowacja/${solution.id}/gmina`} className={buttonVariants({ size: "lg" })}>
          Dostosuj do mojej gminy
        </Link>
        <Link href={`/test/${solution.id}`} className={buttonVariants({ size: "lg", variant: "secondary" })}>
          Zgłoś się do testu
        </Link>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Oceny i opinie</h2>
        <RatingStars value={rating.average} count={rating.count} />
        {reviews.length > 0 && (
          <ul className="divide-y border-y">
            {reviews.map((review, i) => (
              <li key={i} className="flex flex-col gap-2 py-4">
                <RatingStars value={review.rating} />
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
        {/* F2: tu wstawi <Reviews solutionId={id} /> */}
      </section>
    </article>
  )
}
