import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-4xl font-bold">Nie znaleziono strony</h1>
      <p>Ta strona nie istnieje albo została usunięta.</p>
      <Link href="/biblioteka" className={buttonVariants()}>
        Przejdź do biblioteki
      </Link>
    </div>
  )
}
