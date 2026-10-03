import type { Metadata } from "next"

// Strona /zglos jest kliencka, więc tytuł ustawiamy tutaj.
export const metadata: Metadata = { title: "Zgłoś problem" }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
