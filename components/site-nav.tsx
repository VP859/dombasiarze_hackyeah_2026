"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { MenuIcon } from "lucide-react"

import { RoleSwitcher } from "@/components/role-switcher"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Role } from "@/lib/role"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/zglos", label: "Zgłoś problem" },
  { href: "/kreator", label: "Zgłoś rozwiązanie" },
  { href: "/biblioteka", label: "Biblioteka" },
  { href: "/wyzwania", label: "Wyzwania" },
]

export function SiteNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // Panel ROPS widzi w menu tylko rola ROPS.
  const links = role === "admin" ? [...LINKS, { href: "/panel", label: "Panel ROPS" }] : LINKS

  const items = links.map(({ href, label }) => (
    <li key={href}>
      <Link
        href={href}
        onClick={() => setOpen(false)}
        aria-current={pathname.startsWith(href) ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start px-3 decoration-2 underline-offset-8 aria-[current=page]:underline"
        )}
      >
        {label}
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
