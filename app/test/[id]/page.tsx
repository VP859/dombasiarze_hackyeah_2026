import type { Metadata } from "next"

import { TestSignupForm } from "./test-signup-form"

type TestPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TestPageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Dołącz do testu | Podaj Dalej`,
    description: `Zapisz się do testu innowacji społecznej ${id}.`,
  }
}

export default async function TestPage({ params }: TestPageProps) {
  const { id } = await params

  return <TestSignupForm innovationId={id} />
}
