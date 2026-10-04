"use client"

import { useTransition } from "react"
import { PlusIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createCallAction } from "@/app/actions/rops-panel-actions"

export function AddCallButton() {
  const [isPending, startTransition] = useTransition()

  const handleAddCall = () => {
    const title = prompt("Podaj tytuł nowego naboru:")
    if (!title) return
    const deadline = prompt("Podaj termin składania wniosków (YYYY-MM-DD):", "2026-12-31")
    if (!deadline) return

    startTransition(async () => {
      try {
        await createCallAction(title, deadline)
      } catch (err) {
        alert(err instanceof Error ? err.message : "Błąd tworzenia naboru")
      }
    })
  }

  return (
    <Button type="button" onClick={handleAddCall} disabled={isPending}>
      {isPending ? <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" /> : <PlusIcon data-icon="inline-start" aria-hidden />}
      Dodaj nabór
    </Button>
  )
}