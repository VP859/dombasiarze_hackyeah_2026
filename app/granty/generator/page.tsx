import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, CalendarXIcon, LightbulbIcon } from "lucide-react"

import { getOpenCalls } from "@/app/actions/calls-actions"
import { getIdea } from "@/app/actions/ideas"
import { GrantGeneratorForm } from "@/components/grant-generator"
import { EmptyState } from "@/components/empty-state"
import { StageBadge } from "@/components/stage-badge"
import { buttonVariants } from "@/components/ui/button"
import type { Stage } from "@/seed"

export const metadata: Metadata = {
  title: "Wniosek o grant",
  description: "Przygotuj szkic wniosku o grant na podstawie swojego pomysłu.",
}

export default async function GrantGeneratorPage({ searchParams }: PageProps<"/granty/generator">) {
  const { ideaId } = await searchParams
  const id = Array.isArray(ideaId) ? ideaId[0] : ideaId

  if (!id) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <h1 className="text-4xl font-bold text-balance md:text-5xl">Wniosek o grant</h1>
        <EmptyState
          icon={LightbulbIcon}
          title="Najpierw opisz pomysł"
          description="Wniosek przygotujemy na podstawie pomysłu zapisanego w kreatorze."
        >
          <Link href="/kreator" className={buttonVariants({ size: "lg" })}>
            Przejdź do kreatora
          </Link>
        </EmptyState>
      </div>
    )
  }

  const [idea, calls] = await Promise.all([getIdea(id), getOpenCalls()])
  if (!idea) notFound()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link href={`/kreator/${idea.id}`} className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          Wróć do pomysłu
        </Link>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Wniosek o grant</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">{idea.title}</h1>
        <div className="flex flex-col gap-3">
          {idea.stage && <StageBadge stage={idea.stage as Stage} />}
          <p className="max-w-2xl text-xl text-muted-foreground">{idea.essence}</p>
          {idea.audience && (
            <p>
              <span className="text-muted-foreground">Dla kogo:</span> {idea.audience}
            </p>
          )}
        </div>
      </div>

      {calls.length > 0 ? (
        <GrantGeneratorForm ideaId={idea.id} availableCalls={calls} />
      ) : (
        <EmptyState
          icon={CalendarXIcon}
          title="Teraz nie trwa żaden nabór"
          description="Generator wniosków działa w czasie naborów ROPS. Twój pomysł jest zapisany — wróć, gdy ruszy nabór."
        />
      )}
    </div>
  )
}
