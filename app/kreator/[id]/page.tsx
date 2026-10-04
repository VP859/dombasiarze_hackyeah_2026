import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { getOpenCalls } from "@/app/actions/calls-actions"
import { getIdea as getIdeaById } from "@/app/actions/ideas"
import { formatDate } from "@/app/panel/format"
import { StageBadge } from "@/components/stage-badge"
import { buttonVariants } from "@/components/ui/button"
import { CANVAS_FIELDS, type Stage } from "@/seed"

import { IdeaAssistant } from "./idea-assistant"

// Jedno zapytanie na żądanie, choć używają go i metadata, i strona.
const getIdea = cache(getIdeaById)

export async function generateMetadata({ params }: PageProps<"/kreator/[id]">): Promise<Metadata> {
  const { id } = await params
  const idea = await getIdea(id)
  return {
    title: idea?.title ?? "Nie znaleziono pomysłu",
    description: "Rozwiń pomysł na innowację społeczną z pomocą asystenta.",
  }
}

export default async function IdeaPage({ params }: PageProps<"/kreator/[id]">) {
  const { id } = await params
  const [idea, calls] = await Promise.all([getIdea(id), getOpenCalls()])
  if (!idea) notFound()

  const canvas = CANVAS_FIELDS.filter(({ key }) => idea.canvas?.[key])

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-12">
      <div className="flex flex-col gap-4">
        <Link href="/kreator" className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          Zgłoś kolejny pomysł
        </Link>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Fiszka pomysłu</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">{idea.title}</h1>
        {idea.stage && <StageBadge stage={idea.stage as Stage} />}
        <p className="max-w-2xl text-xl">{idea.essence}</p>
        {idea.audience && (
          <p>
            <span className="text-muted-foreground">Dla kogo:</span> {idea.audience}
          </p>
        )}
      </div>

      {canvas.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Kanwa innowacji</h2>
          <dl className="grid gap-6 md:grid-cols-2">
            {canvas.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-2 border-t pt-4">
                <dt className="font-semibold">{label}</dt>
                <dd className="text-muted-foreground">{idea.canvas?.[key]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <IdeaAssistant ideaId={idea.id} />

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Wsparcie mentora</h2>
        <p className="max-w-2xl">
          Mentorzy Hubu to eksperci, którzy pomagają rozwijać pomysły, szukać partnerów i przygotować test.
          Odpowiedź przyjdzie na Twój e-mail.
        </p>
        <Link
          href={`/zapytaj?pomysl=${idea.id}`}
          className={buttonVariants({ variant: "outline", size: "lg", className: "self-start" })}
        >
          Zapytaj mentora o ten pomysł
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Wniosek o grant</h2>
        {calls.length > 0 ? (
          <>
            <p className="max-w-2xl">
              Trwa nabór. Asystent przygotuje szkic wniosku dopasowany do zasad wybranego naboru.
            </p>
            <ul className="flex flex-col gap-1 text-muted-foreground">
              {calls.map((call) => (
                <li key={call.id}>
                  {call.title} — wnioski do {formatDate(call.deadline)}
                </li>
              ))}
            </ul>
            <Link
              href={`/granty/generator?ideaId=${idea.id}`}
              className={buttonVariants({ size: "lg", className: "self-start" })}
            >
              Przygotuj wniosek o grant
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </Link>
          </>
        ) : (
          <p className="max-w-2xl text-muted-foreground">
            Teraz nie trwa żaden nabór. Generator wniosków działa w czasie naborów ROPS — pomysł jest
            zapisany, wróć tu, gdy ruszy nabór.
          </p>
        )}
      </section>
    </article>
  )
}
