import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, LightbulbIcon } from "lucide-react"

import { GrantGeneratorForm, type Call } from "@/components/grant-generator"
import { EmptyState } from "@/components/empty-state"
import { StageBadge } from "@/components/stage-badge"
import { buttonVariants } from "@/components/ui/button"
import { getSupabaseAdmin } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "Wniosek o grant",
  description: "Przygotuj szkic wniosku o grant na podstawie swojego pomysłu.",
}

// Gdy w bazie nie ma otwartych naborów — akcja i tak dobierze pierwszy nabór albo go utworzy.
const FALLBACK_CALLS: Call[] = [{ id: "1", title: "Małopolskie Innowacje Społeczne 2026", deadline: "2026-11-30" }]

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

  const supabase = getSupabaseAdmin()
  const [{ data: idea }, { data: calls }] = await Promise.all([
    supabase.from("ideas").select("title, essence, audience, stage").eq("id", id).maybeSingle(),
    supabase.from("calls").select("id, title, deadline").eq("open", true).order("deadline"),
  ])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link href="/kreator" className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          Wróć do kreatora
        </Link>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Wniosek o grant</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">{idea?.title ?? "Twój pomysł"}</h1>
        {idea && (
          <div className="flex flex-col gap-3">
            {idea.stage && <StageBadge stage={idea.stage} />}
            <p className="max-w-2xl text-xl text-muted-foreground">{idea.essence}</p>
            {idea.audience && (
              <p>
                <span className="text-muted-foreground">Dla kogo:</span> {idea.audience}
              </p>
            )}
          </div>
        )}
      </div>

      <GrantGeneratorForm ideaId={id} availableCalls={calls?.length ? calls : FALLBACK_CALLS} />
    </div>
  )
}
