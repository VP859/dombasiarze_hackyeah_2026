"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// Przycisk zamiast skrótu „d” — jednoznakowe skróty łamią WCAG 2.1.4.
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Przełącz tryb jasny lub ciemny"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon aria-hidden className="dark:hidden" />
      <MoonIcon aria-hidden className="hidden dark:block" />
    </Button>
  )
}

export { ThemeProvider, ThemeToggle }
