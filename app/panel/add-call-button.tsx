"use client"

import React, { useState, useTransition } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { createCallAction } from "@/app/actions/calls-actions"

export function AddCallButton() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [deadline, setDeadline] = useState("")
  const [rules, setRules] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deadline) return

    startTransition(async () => {
      try {
        await createCallAction({ title, deadline, rules })
        setTitle("")
        setDeadline("")
        setRules("")
        setOpen(false)
      } catch (err: unknown) {
        alert((err as { message: string }).message || "Błąd dodawania naboru")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button type="button">
            <PlusIcon data-icon="inline-start" aria-hidden />
            Dodaj nabór
          </Button>
        }
      />
      <SheetContent className="w-full! sm:max-w-md!">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            Nowy Nabór Grantowy
          </SheetTitle>
          <SheetDescription>
            Wprowadź szczegóły nowego konkursu dla innowatorów.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 py-6"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="call-title" className="text-sm font-semibold">
              Nazwa naboru <span className="text-red-500">*</span>
            </label>
            <Input
              id="call-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Małopolskie Innowacje Społeczne 2026"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="call-deadline" className="text-sm font-semibold">
              Termin składania wniosków <span className="text-red-500">*</span>
            </label>
            <Input
              id="call-deadline"
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="call-rules" className="text-sm font-semibold">
              Zasady naboru
            </label>
            <Textarea
              id="call-rules"
              aria-describedby="call-rules-help"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="np. granty do 50 000 zł na pilotaż, priorytet: seniorzy, wymagany partner lokalny"
            />
            <p id="call-rules-help" className="text-sm text-muted-foreground">
              Kwoty, kto może składać, priorytety i wymagania. Asystent dopasuje do nich każdy wniosek.
            </p>
          </div>

          <SheetFooter className="mt-auto border-t pt-4">
            <SheetClose
              render={
                <Button type="button" variant="outline">
                  Anuluj
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={isPending || !title.trim() || !deadline}
            >
              {isPending ? "Zapisywanie..." : "Utwórz nabór"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
