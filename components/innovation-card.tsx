import Link from "next/link"

import { RatingStars } from "@/components/rating-stars"
import { StageBadge } from "@/components/stage-badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getRating, type Solution } from "@/seed"

// Cała karta klikalna przez jeden link w tytule (after:inset-0), więc czytnik słyszy tylko tytuł.
export function InnovationCard({ solution }: { solution: Solution }) {
  const rating = getRating(solution.id)
  return (
    <Card className="relative h-full">
      <CardHeader>
        <CardTitle>
          <h3>
            <Link
              href={`/innowacja/${solution.id}`}
              className="underline-offset-4 after:absolute after:inset-0 hover:underline"
            >
              {solution.title}
            </Link>
          </h3>
        </CardTitle>
        <CardDescription className="line-clamp-2">{solution.method}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex-wrap justify-between gap-3">
        <StageBadge stage={solution.stage} />
        <RatingStars value={rating.average} count={rating.count} />
      </CardFooter>
    </Card>
  )
}
