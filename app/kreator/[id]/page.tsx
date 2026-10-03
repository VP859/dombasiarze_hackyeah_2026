import type { Metadata } from "next"

import { IdeaDevelopment } from "./idea-development"

export const metadata: Metadata = {
  title: "Rozwijanie pomysłu",
  description: "Rozwiń pomysł na innowację społeczną z pomocą asystenta.",
}

export default async function IdeaPage({ params }: PageProps<"/kreator/[id]">) {
  const { id } = await params

  return <IdeaDevelopment ideaId={id} />
}
