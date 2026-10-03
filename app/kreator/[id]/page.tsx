import type { Metadata } from "next"

import { IdeaDevelopment } from "./idea-development"

type IdeaPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: IdeaPageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Rozwijanie pomysłu ${id}`,
    description: "Rozwiń pomysł na innowację społeczną z pomocą asystenta.",
  }
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { id } = await params

  return <IdeaDevelopment ideaId={id} />
}
