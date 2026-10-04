import Link from "next/link"

import { RatingStars } from "@/components/rating-stars"
import { StageBadge } from "@/components/stage-badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Stage } from "@/seed"

type CardSolution = { id: string; title: string; method: string; stage?: Stage }

// Cała karta klikalna przez jeden link w tytule (after:inset-0), więc czytnik słyszy tylko tytuł.
// Działa z danymi z seed i z Supabase — ocenę i adres podaje strona.
export function InnovationCard({
  solution,
  rating,
  href = `/innowacja/${solution.id}`,
}: {
  solution: CardSolution
  rating?: { average: number; count: number }
  href?: string
}) {
  return (
    <Card className="relative h-full">
      <CardHeader>
        <CardTitle>
          <h3>
            <Link href={href} className="underline-offset-4 after:absolute after:inset-0 hover:underline">
              {solution.title}
            </Link>
          </h3>
        </CardTitle>
        <CardDescription className="line-clamp-2">{solution.method}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex-wrap justify-between gap-3">
        {solution.stage && <StageBadge stage={solution.stage} />}
        {rating && <RatingStars value={rating.average} count={rating.count} />}
      </CardFooter>
    </Card>
  )
}
