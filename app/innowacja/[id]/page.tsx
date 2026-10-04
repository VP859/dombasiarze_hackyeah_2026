import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import {
  ArrowLeftIcon,
  CheckIcon,
  CircleAlertIcon,
  ExternalLinkIcon,
  LightbulbIcon,
  VideoIcon,
} from "lucide-react"

import { addReview, getReviewsForSolution, getSolutionById } from "@/app/actions/solutions"
import { RatingStars } from "@/components/rating-stars"
import { StageBadge } from "@/components/stage-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { ROLE_COOKIE, ROLE_VIEW, toRole, type InnovationAction } from "@/lib/role"
import { cn } from "@/lib/utils"

// Jedno zapytanie na żądanie, choć używają go i metadata, i strona.
const getSolution = cache(getSolutionById)

// Przyciski w panelu bocznym — które i w jakiej kolejności, zależy od roli (lib/role.ts).
const actionLink = (id: string, action: InnovationAction) =>
  ({
    gmina: { href: `/innowacja/${id}/gmina`, label: "Dostosuj do mojej gminy" },
    test: { href: `/test/${id}`, label: "Zgłoś się do testu" },
    plakat: { href: `/test/${id}/plakat`, label: "Zorganizuj test: plakat z kodem QR" },
    opinia: { href: "#opinia", label: "Oceń innowację" },
    kreator: { href: "/kreator", label: "Mam podobny pomysł" },
    panel: { href: "/panel", label: "Sprawdź w Panelu ROPS" },
    pytanie: { href: `/zapytaj?innowacja=${id}`, label: "Zadaj pytanie o tę innowację" },
  })[action]

// ponytail: dzielenie tekstu z bazy na punkty; gdy backend da tablice, użyć ich wprost.
const sentences = (text: string) => text.split(/(?<=\.)\s+/).map((s) => s.replace(/\.$/, ""))
const items = (text: string) => text.replace(/\.$/, "").split(/,\s*/)

const RATINGS = [
  { value: 5, label: "Bardzo dobra" },
  { value: 4, label: "Dobra" },
  { value: 3, label: "Średnia" },
  { value: 2, label: "Słaba" },
  { value: 1, label: "Bardzo słaba" },
]

export async function generateMetadata({ params }: PageProps<"/innowacja/[id]">): Promise<Metadata> {
  const { id } = await params
  const solution = await getSolution(id)
  return { title: solution?.title ?? "Nie znaleziono innowacji" }
}

export default async function Page({ params, searchParams }: PageProps<"/innowacja/[id]">) {
  const { id } = await params
  const solution = await getSolution(id)
  if (!solution) notFound()

  // Wejście z wyników „Zgłoś problem” (?od=<id zgłoszenia>) — link wraca do tych wyników, nie do biblioteki.
  const { od } = await searchParams
  const back =
    typeof od === "string"
      ? { href: `/zglos?wynik=${encodeURIComponent(od)}`, label: "Wróć do dopasowanych innowacji" }
      : { href: "/biblioteka", label: "Wróć do biblioteki" }

  const reviews = await getReviewsForSolution(id).catch(() => [])
  const role = toRole((await cookies()).get(ROLE_COOKIE)?.value)
  const expert = role === "expert"
  const rating = {
    count: reviews.length,
    average: reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1),
  }
  const links = [
    solution.video_url && { href: solution.video_url, label: "Obejrzyj film", icon: VideoIcon },
    solution.source_url && { href: solution.source_url, label: "Strona źródłowa", icon: ExternalLinkIcon },
  ].filter((link) => !!link)

  return (
    <article className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Link href={back.href} className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          {back.label}
        </Link>
        <h1 className="max-w-3xl text-4xl font-bold text-balance md:text-5xl">{solution.title}</h1>
        <StageBadge stage={solution.stage} />
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_20rem]">
        {/* Najpierw w DOM: na telefonie fakty i przyciski są od razu pod tytułem. */}
        <aside className="flex flex-col gap-6 rounded-4xl bg-muted p-6 lg:sticky lg:top-24 lg:order-last">
          <dl className="flex flex-col gap-4">
            {solution.audience && (
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Dla kogo</dt>
                <dd className="font-medium">{solution.audience}</dd>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Ocena</dt>
              <dd>
                <RatingStars value={rating.average} count={rating.count} />
              </dd>
            </div>
            {links.length > 0 && (
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Materiały</dt>
                <dd className="flex flex-col gap-1">
                  {links.map(({ href, label, icon: Icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-fit items-center gap-2 font-medium underline underline-offset-4"
                    >
                      <Icon aria-hidden className="size-5" />
                      {label}
                      <span className="sr-only"> (otwiera się w nowej karcie)</span>
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <div className="flex flex-col gap-3">
            {ROLE_VIEW[role].innovation.map((action, i) => {
              const { href, label } = actionLink(solution.id, action)
              return (
                <Link
                  key={action}
                  href={href}
                  className={cn(buttonVariants({ size: "lg", variant: i ? "outline" : "default" }), "w-full")}
                >
                  {action === "opinia" && expert ? "Dodaj opinię eksperta" : label}
                </Link>
              )
            })}
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

          {solution.effect && (
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
          )}

          {solution.resources && (
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
          )}

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold">Oceny i opinie</h2>
              <RatingStars value={rating.average} count={rating.count} />
            </div>

            {reviews.length > 0 ? (
              <ul className="divide-y border-y">
                {reviews.map((review) => (
                  <li key={review.id} className="flex max-w-[65ch] flex-col gap-2 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <RatingStars value={review.rating} />
                      <time dateTime={review.created_at} className="text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("pl-PL")}
                      </time>
                    </div>
                    {review.comment && <p>{review.comment}</p>}
                    {review.improvement && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Co poprawić: </span>
                        {review.improvement}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nikt jeszcze nie ocenił tej innowacji. Bądź pierwszy.</p>
            )}

            {/* Akcja serwera: działa też bez JS, po wysłaniu strona odświeża listę opinii. */}
            <Card id="opinia" className="scroll-mt-28">
              <CardHeader>
                <CardTitle>
                  <h3>{expert ? "Opinia eksperta" : "Dodaj opinię"}</h3>
                </CardTitle>
                <CardDescription>
                  {expert
                    ? "Oceń, czy tę innowację warto wdrażać w innych gminach. Twoja ocena pomoże samorządom wybrać."
                    : "Podziel się tym, jak innowacja sprawdziła się w praktyce."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={addReview} className="flex flex-col gap-8">
                  <input type="hidden" name="solution_id" value={solution.id} />
                  <FieldGroup>
                    <FieldSet>
                      <FieldLegend>Ocena</FieldLegend>
                      <div className="flex flex-wrap gap-2">
                        {RATINGS.map(({ value, label }) => (
                          <label
                            key={value}
                            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border px-4 has-checked:border-primary has-checked:bg-muted"
                          >
                            <input
                              type="radio"
                              name="rating"
                              value={value}
                              required
                              className="size-5 shrink-0 accent-primary"
                            />
                            {value} – {label}
                          </label>
                        ))}
                      </div>
                    </FieldSet>
                    <Field>
                      <FieldLabel htmlFor="comment">Opinia</FieldLabel>
                      <Textarea id="comment" name="comment" placeholder="Jak innowacja sprawdziła się w praktyce?" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="improvement">Co warto poprawić?</FieldLabel>
                      <Textarea
                        id="improvement"
                        name="improvement"
                        placeholder="Co inne gminy powinny zmienić przed wdrożeniem?"
                      />
                    </Field>
                  </FieldGroup>
                  <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start">
                    Wyślij opinię
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </article>
  )
}
