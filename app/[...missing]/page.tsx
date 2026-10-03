import type { Metadata } from "next"
import { notFound } from "next/navigation"

// Nieistniejące adresy: własny tytuł strony 404 (not-found.tsx nie ustawia metadanych).
export const metadata: Metadata = { title: "Nie znaleziono strony" }

export default function Page() {
  notFound()
}
