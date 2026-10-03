import { redirect } from "next/navigation"

// „Dostosuj do gminy” jest teraz na /innowacja/[id]/gmina — stare linki przekierowujemy.
export default async function Page({ params }: PageProps<"/eksploracja-innowacji/[id]/adapt">) {
  const { id } = await params
  redirect(`/innowacja/${id}/gmina`)
}
