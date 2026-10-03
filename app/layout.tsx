import type { Metadata } from "next"
import { Figtree, Inter } from "next/font/google"
import Link from "next/link"
import Script from "next/script"

import "./globals.css"
import { RoleSwitcher } from "@/components/role-switcher"
import { SiteNav } from "@/components/site-nav"
import { TextSizeToggle } from "@/components/text-size-toggle"
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider"
import { buttonVariants } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" })
const figtree = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: {
    default: "Podaj Dalej — Małopolski Hub Innowacji Społecznych",
    template: "%s · Podaj Dalej",
  },
  description:
    "Znajdź sprawdzone innowacje społeczne i wdróż je w swojej gminie. Małopolski Hub Innowacji Społecznych, ROPS Kraków.",
}

// Przywraca rozmiar tekstu z przycisku A+ przed pierwszym malowaniem (bez mignięcia).
const textSizeScript = `try{var s=localStorage.getItem("text-size");if(s)document.documentElement.style.fontSize=s}catch(e){}`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={cn("scroll-pt-24 font-sans antialiased", inter.variable, figtree.variable)}
    >
      <head>
        <Script
          id="text-size-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: textSizeScript }}
        />
      </head>
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <TooltipProvider>
            <a
              href="#main"
              className={cn(buttonVariants(), "sr-only focus:not-sr-only focus:m-2 focus:self-start")}
            >
              Przejdź do treści
            </a>
            {/* Przyklejony tylko przy wysokim oknie — przy dużym powiększeniu nie zasłania treści. */}
            <header className="top-0 z-40 border-b print:hidden bg-background/85 backdrop-blur-md [@media(min-height:30rem)]:sticky [@media(prefers-reduced-transparency:reduce)]:bg-background">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
                <Link href="/" className="mr-auto font-heading text-2xl font-bold">
                  Podaj Dalej
                </Link>
                <SiteNav />
                <RoleSwitcher />
                <TextSizeToggle />
                <ThemeToggle />
              </div>
            </header>
            <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 outline-none">
              {children}
            </main>
            <footer className="border-t print:hidden">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-muted-foreground">
                <p>Małopolski Hub Innowacji Społecznych · ROPS Kraków</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <Link href="/panel" className="underline underline-offset-4">
                    Panel ROPS
                  </Link>
                  <Link href="/deklaracja-dostepnosci" className="underline underline-offset-4">
                    Deklaracja dostępności
                  </Link>
                </div>
              </div>
            </footer>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}