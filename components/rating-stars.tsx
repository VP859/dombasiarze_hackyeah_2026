import { StarHalfIcon, StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const OPINIE = { one: "opinia", few: "opinie", many: "opinii", other: "opinii" }

// Tylko wyświetlanie. Ocenianie robi F2 w components/reviews.tsx.
export function RatingStars({ value, count }: { value: number; count?: number }) {
  if (count === 0) return <p className="text-muted-foreground">Brak ocen</p>

  const label = value.toLocaleString("pl-PL", { maximumFractionDigits: 1 })
  const rounded = Math.round(value * 2) / 2 // do połówek

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span role="img" aria-label={`Ocena ${label} na 5`} className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="relative">
            <StarIcon
              aria-hidden
              className={cn("size-5", i <= rounded ? "fill-current" : "text-muted-foreground")}
            />
            {i - 0.5 === rounded && (
              <StarHalfIcon aria-hidden className="absolute inset-0 size-5 fill-current" />
            )}
          </span>
        ))}
      </span>
      <span aria-hidden className="font-medium">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground">
          ({count} {OPINIE[new Intl.PluralRules("pl").select(count) as keyof typeof OPINIE]})
        </span>
      )}
    </div>
  )
}
