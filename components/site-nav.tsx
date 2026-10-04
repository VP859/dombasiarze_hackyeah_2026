"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { MenuIcon } from "lucide-react"

import { RoleSwitcher } from "@/components/role-switcher"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Role } from "@/lib/role"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/zglos", label: "Zgłoś problem" },
  { href: "/kreator", label: "Zgłoś rozwiązanie" },
  { href: "/biblioteka", label: "Biblioteka" },
  { href: "/wyzwania", label: "Wyzwania" },
  { href: "/zapytaj", label: "Zadaj pytanie" },
]

// Skrzynka roli: Panel ROPS widzi tylko ROPS, pytania do mentorów — tylko Ekspert.
// Te role odpowiadają na pytania, więc skrzynka zastępuje im „Zadaj pytanie”.
const INBOX: Partial<Record<Role, { href: string; label: string }>> = {
  admin: { href: "/panel", label: "Panel ROPS" },
  expert: { href: "/mentor", label: "Strefa mentora" },
}

/** inbox — ile spraw czeka na rolę (nowe zgłoszenia, pomysły, pytania bez odpowiedzi). */
export function SiteNav({ role, inbox }: { role: Role; inbox: number }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const links: { href: string; label: string; count?: number }[] = INBOX[role]
    ? [...LINKS.filter((link) => link.href !== "/zapytaj"), { ...INBOX[role], count: inbox }]
    : LINKS

  const items = links.map(({ href, label, count }) => (
    <li key={href}>
      <Link
        href={href}
        onClick={() => setOpen(false)}
        aria-current={pathname.startsWith(href) ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "relative w-full justify-start px-3 decoration-2 underline-offset-8 aria-[current=page]:underline"
        )}
      >
        {label}
        {/* Na szerokim ekranie w rogu linku, bez zajmowania miejsca — inaczej nagłówek ROPS zawija się do dwóch wierszy. */}
        {!!count && (
          <Badge className="ml-1 min-w-5 px-1 xl:absolute xl:-top-1.5 xl:-right-1.5 xl:ml-0">
            <span className="sr-only">, czeka spraw:</span> {count}
          </Badge>
        )}
      </Link>
    </li>
  ))

  return (
    <>
      <nav aria-label="Menu główne" className="hidden xl:block">
        <ul className="flex gap-1">{items}</ul>
      </nav>
      <RoleSwitcher role={role} className="hidden sm:flex" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" size="icon" className="xl:hidden" />}>
          <MenuIcon aria-hidden />
          <span className="sr-only">Otwórz menu</span>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <RoleSwitcher role={role} className="pr-4 pl-7 sm:hidden" />
          <nav aria-label="Menu główne" className="px-4">
            <ul className="flex flex-col gap-1">{items}</ul>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
