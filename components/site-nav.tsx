"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { MenuIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/zglos", label: "Zgłoś problem" },
  { href: "/biblioteka", label: "Biblioteka" },
  { href: "/kreator", label: "Kreator" },
  { href: "/wyzwania", label: "Wyzwania" },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const items = LINKS.map(({ href, label }) => (
    <li key={href}>
      <Link
        href={href}
        onClick={() => setOpen(false)}
        aria-current={pathname.startsWith(href) ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start decoration-2 underline-offset-8 aria-[current=page]:underline"
        )}
      >
        {label}
      </Link>
    </li>
  ))

  return (
    <>
      <nav aria-label="Menu główne" className="hidden md:block">
        <ul className="flex gap-1">{items}</ul>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" />}>
          <MenuIcon aria-hidden />
          <span className="sr-only">Otwórz menu</span>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav aria-label="Menu główne" className="px-4">
            <ul className="flex flex-col gap-1">{items}</ul>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
