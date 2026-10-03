import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import { ArrowLeftIcon } from "lucide-react"

import { getSolutionById } from "@/app/actions/solutions"

import { AdaptForm } from "./adapt-form"

const getSolution = cache(getSolutionById)

export async function generateMetadata({ params }: PageProps<"/innowacja/[id]/gmina">): Promise<Metadata> {
  const { id } = await params
  const solution = await getSolution(id)
  return { title: solution ? `Dostosuj do gminy: ${solution.title}` : "Nie znaleziono innowacji" }
}

export default async function Page({ params }: PageProps<"/innowacja/[id]/gmina">) {
  const { id } = await params
  const solution = await getSolution(id)
  if (!solution) notFound()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link href={`/innowacja/${id}`} className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          Wróć do innowacji
        </Link>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Dostosuj do gminy</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">{solution.title}</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Opisz swoją gminę. Asystent AI przygotuje plan wdrożenia krok po kroku, dopasowany do Waszych
          warunków.
        </p>
      </div>

      <AdaptForm solutionId={id} />
    </div>
  )
}
