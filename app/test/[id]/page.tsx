import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getSolution } from "@/seed"

import { TestSignupForm } from "./test-signup-form"

type TestPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TestPageProps): Promise<Metadata> {
  const { id } = await params
  const solution = getSolution(id)

  return {
    title: solution ? `Dołącz do testu: ${solution.title}` : "Nie znaleziono innowacji",
    description: solution?.method ?? "Zapisz się do testu innowacji społecznej.",
  }
}

export default async function TestPage({ params }: TestPageProps) {
  const { id } = await params
  const solution = getSolution(id)

  if (!solution) notFound()

  return (
    <TestSignupForm
      innovationId={solution.id}
      innovationName={solution.title}
      innovationDescription={solution.method}
    />
  )
}
