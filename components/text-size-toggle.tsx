"use client"

import { useLayoutEffect } from "react"

import { Button } from "@/components/ui/button"

const SIZES = ["100%", "112.5%", "125%"]

// Zapisany rozmiar przywraca skrypt w app/layout.tsx przed pierwszym malowaniem.
export function TextSizeToggle() {
  // Ponowne ustawienie po remoncie w trybie dev (React czyści atrybuty <html>). W produkcji nic nie zmienia.
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("text-size")
      if (saved) document.documentElement.style.fontSize = saved
    } catch {}
  }, [])

  function cycle() {
    const html = document.documentElement
    const next = SIZES[(SIZES.indexOf(html.style.fontSize || "100%") + 1) % SIZES.length]
    html.style.fontSize = next
    try {
      localStorage.setItem("text-size", next)
    } catch {}
  }

  return (
    <Button variant="outline" size="icon" aria-label="Powiększ tekst" onClick={cycle}>
      A+
    </Button>
  )
}
