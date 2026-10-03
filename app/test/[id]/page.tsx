import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getSolution } from "@/seed"

import { TestSignupForm } from "./test-signup-form"

export async function generateMetadata({ params }: PageProps<"/test/[id]">): Promise<Metadata> {
  const { id } = await params
  const solution = getSolution(id)
  return {
    title: solution ? `Zgłoś się do testu: ${solution.title}` : "Nie znaleziono innowacji",
    description: "Zapisz się do testu innowacji społecznej.",
  }
}

export default async function TestPage({ params }: PageProps<"/test/[id]">) {
  const { id } = await params
  const solution = getSolution(id)
  if (!solution) notFound()

  return <TestSignupForm innovationId={id} name={solution.title} description={solution.method} />
}
