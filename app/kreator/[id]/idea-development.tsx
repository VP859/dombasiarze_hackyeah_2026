"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Send, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

type IdeaDevelopmentProps = {
  ideaId: string
}

const questions = [
  {
    id: "need",
    title: "Jaka potrzeba stoi za pomysłem?",
    hint: "Opisz sytuację osób, którym chcesz pomóc.",
  },
  {
    id: "change",
    title: "Co zmieni się dzięki temu rozwiązaniu?",
    hint: "Napisz, po czym poznasz, że pomysł działa.",
  },
  {
    id: "first-step",
    title: "Jaki będzie pierwszy krok?",
    hint: "Pomyśl o działaniu, które możesz wykonać w najbliższych tygodniach.",
  },
] as const

const directions = [
  {
    title: "Zacznij od sąsiedztwa",
    text: "Przetestuj pomysł z małą grupą mieszkańców i lokalnym partnerem.",
  },
  {
    title: "Połącz siły z gminą",
    text: "Sprawdź, które zasoby gminy mogą pomóc w uruchomieniu rozwiązania.",
  },
  {
    title: "Zmierz pierwsze efekty",
    text: "Ustal prosty sposób zbierania opinii i obserwowania zmiany.",
  },
]

export function IdeaDevelopment({ ideaId }: IdeaDevelopmentProps) {
  const [showApplication, setShowApplication] = useState(false)
  const [applicationSent, setApplicationSent] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  function handleApplicationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApplicationSent(true)
  }

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessageSent(true)
  }

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-10">
      <header className="flex flex-col gap-5">
        <Link href="/kreator" className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeft aria-hidden="true" className="size-5" />
          Wróć do kreatora
        </Link>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex min-h-9 items-center rounded-full bg-primary/10 px-3 text-sm font-medium text-primary">
              Pomysł
            </span>
            <span className="text-sm text-muted-foreground">Fiszka: {ideaId}</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
            Sąsiedzkie wsparcie dla opiekunów
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            Krótkie spotkania i wymiana pomocy dla osób, które na co dzień opiekują się bliskimi.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Dla kogo: opiekunowie osób zależnych</p>
        </div>
      </header>

      <section className="rounded-3xl border border-amber-700 bg-amber-50 p-6 text-amber-950 shadow-sm sm:p-8 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-100">
        <div className="flex gap-4">
          <Lightbulb aria-hidden="true" className="mt-1 size-7 shrink-0" />
          <div>
            <h2 className="text-xl font-semibold">Podobna innowacja już istnieje</h2>
            <p className="mt-2 leading-7">
              W bibliotece znaleźliśmy rozwiązanie o podobnym celu. Możesz je porównać i sprawdzić, co warto dostosować.
            </p>
            <Link href="/innowacja/sasiedzkie-odwiedziny" className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4">
              Zobacz podobną innowację
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-3">
            <Sparkles aria-hidden="true" className="size-6 text-primary" />
            <h2 className="text-3xl font-bold">Pytania asystenta</h2>
          </div>
          <p className="mt-2 text-muted-foreground">Odpowiedz własnymi słowami. Nie musisz znać gotowych odpowiedzi.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <span className="text-sm font-semibold text-primary">Pytanie {index + 1}</span>
              <label htmlFor={question.id} className="mt-3 block font-semibold">
                {question.title}
              </label>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.hint}</p>
              <textarea
                id={question.id}
                name={question.id}
                rows={5}
                className="mt-4 w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold">Kierunki rozwoju</h2>
          <p className="mt-2 text-muted-foreground">Wybierz kierunek, który najlepiej pasuje do Twojego pomysłu.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {directions.map((direction) => (
            <article key={direction.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <Sparkles aria-hidden="true" className="size-6 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">{direction.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{direction.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-bold">Wniosek do naboru</h2>
          <p className="max-w-2xl leading-7 text-muted-foreground">
            Asystent przygotuje roboczą wersję wniosku na podstawie Twoich odpowiedzi.
          </p>
        </div>
        {!showApplication && (
          <Button type="button" size="lg" className="mt-6" onClick={() => setShowApplication(true)}>
            Przygotuj wniosek do naboru
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
        {showApplication && (
          applicationSent ? (
            <div className="mt-6 rounded-2xl border border-emerald-700 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100" role="status" aria-live="polite">
              <CheckCircle2 aria-hidden="true" className="mb-2 size-7" />
              Wniosek został zapisany jako wersja robocza.
            </div>
          ) : (
            <form onSubmit={handleApplicationSubmit} className="mt-6 flex flex-col gap-6">
              <div>
                <label htmlFor="application-title" className="mb-2 block font-medium">Nazwa projektu</label>
                <input id="application-title" name="applicationTitle" defaultValue="Sąsiedzkie wsparcie dla opiekunów" required className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div>
                <label htmlFor="application-description" className="mb-2 block font-medium">Opis projektu</label>
                <textarea id="application-description" name="applicationDescription" defaultValue="Pilotaż lokalnego programu wymiany wsparcia między opiekunami osób zależnych." rows={5} required className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div>
                <label htmlFor="application-contact" className="mb-2 block font-medium">Osoba do kontaktu</label>
                <input id="application-contact" name="applicationContact" placeholder="Imię i e-mail" required className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div>
                <h3 className="font-semibold">Czego brakuje</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  <li>potwierdzenia partnera do pilotażu,</li>
                  <li>szacunkowego budżetu,</li>
                  <li>planu pomiaru efektów.</li>
                </ul>
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Zapisz wersję roboczą
              </Button>
            </form>
          )
        )}
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold">Wątek rozmowy z ROPS</h2>
          <p className="mt-2 text-muted-foreground">Możesz zadać pytanie osobie, która pomoże rozwinąć pomysł.</p>
        </div>
        <div className="flex flex-col gap-4">
          <article className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">ROPS</span>
              <time className="text-sm text-muted-foreground" dateTime="2026-10-03">3 października 2026</time>
            </div>
            <p className="mt-4 leading-7">Dobry początek. Warto sprawdzić, czy lokalny ośrodek pomocy społecznej może zostać partnerem pilotażu.</p>
          </article>
          <form onSubmit={handleMessageSubmit} className="rounded-2xl border border-border bg-card p-5">
            <label htmlFor="message" className="mb-2 block font-medium">Twoja wiadomość</label>
            <textarea id="message" name="message" rows={4} required placeholder="Napisz wiadomość do ROPS" className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30" />
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg">
                Wyślij
                <Send aria-hidden="true" />
              </Button>
              <span className="text-sm text-muted-foreground">Odpowiedź przyjdzie też e-mailem.</span>
            </div>
            {messageSent && <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite">Wiadomość została wysłana.</p>}
          </form>
        </div>
      </section>
    </article>
  )
}
