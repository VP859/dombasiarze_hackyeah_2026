import { redirect } from "next/navigation"

// Szczegóły innowacji są teraz na /innowacja/[id] — stare linki przekierowujemy.
export default async function Page({ params }: PageProps<"/eksploracja-innowacji/[id]">) {
  const { id } = await params
  redirect(`/innowacja/${id}`)
}
