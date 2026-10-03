"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, LightbulbIcon, SendIcon, SparklesIcon } from "lucide-react"

import { StageBadge } from "@/components/stage-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    <article className="mx-auto flex max-w-4xl flex-col gap-12">
      <div className="flex flex-col gap-4">
        <Link href="/kreator" className="flex w-fit items-center gap-2 underline underline-offset-4">
          <ArrowLeftIcon aria-hidden className="size-5" />
          Wróć do zgłoszenia rozwiązania
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <StageBadge stage="pomysł" />
          <span className="text-muted-foreground">Fiszka: {ideaId}</span>
        </div>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">Sąsiedzkie wsparcie dla opiekunów</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Krótkie spotkania i wymiana pomocy dla osób, które na co dzień opiekują się bliskimi.
        </p>
        <p>
          <span className="text-muted-foreground">Dla kogo:</span> opiekunowie osób zależnych
        </p>
      </div>

      <Alert role="note">
        <LightbulbIcon aria-hidden />
        <AlertTitle>Podobna innowacja już istnieje</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <p>
            W bibliotece znaleźliśmy rozwiązanie o podobnym celu. Możesz je porównać i sprawdzić, co warto
            dostosować.
          </p>
          <Link
            href="/innowacja/sasiedzkie-odwiedziny"
            className="flex items-center gap-2 font-medium text-foreground underline underline-offset-4"
          >
            Zobacz podobną innowację
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </AlertDescription>
      </Alert>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <SparklesIcon aria-hidden className="size-6 text-primary" />
            Pytania asystenta
          </h2>
          <p className="text-muted-foreground">Odpowiedz własnymi słowami. Nie musisz znać gotowych odpowiedzi.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {questions.map((question, index) => (
            <Card key={question.id} size="sm">
              <CardContent>
                <Field>
                  <span className="font-semibold text-primary">Pytanie {index + 1}</span>
                  <FieldLabel htmlFor={question.id} className="font-semibold">
                    {question.title}
                  </FieldLabel>
                  <FieldDescription>{question.hint}</FieldDescription>
                  <Textarea id={question.id} name={question.id} />
                </Field>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Kierunki rozwoju</h2>
          <p className="text-muted-foreground">Wybierz kierunek, który najlepiej pasuje do Twojego pomysłu.</p>
        </div>
        <ol className="grid gap-8 md:grid-cols-3">
          {directions.map((direction, index) => (
            <li key={direction.title} className="flex flex-col gap-2 border-t pt-4">
              <span aria-hidden className="text-muted-foreground">
                Kierunek {index + 1}
              </span>
              <h3 className="text-xl font-semibold">{direction.title}</h3>
              <p className="text-muted-foreground">{direction.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Wniosek do naboru</h2>
          </CardTitle>
          <CardDescription>Asystent przygotuje roboczą wersję wniosku na podstawie Twoich odpowiedzi.</CardDescription>
        </CardHeader>
        <CardContent>
          {!showApplication ? (
            <Button type="button" size="lg" onClick={() => setShowApplication(true)}>
              Przygotuj wniosek do naboru
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </Button>
          ) : applicationSent ? (
            <Alert role="status">
              <CheckCircle2Icon aria-hidden />
              <AlertDescription>Wniosek został zapisany jako wersja robocza.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleApplicationSubmit} className="flex flex-col gap-8">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="application-title">Nazwa projektu</FieldLabel>
                  <Input
                    id="application-title"
                    name="applicationTitle"
                    defaultValue="Sąsiedzkie wsparcie dla opiekunów"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="application-description">Opis projektu</FieldLabel>
                  <Textarea
                    id="application-description"
                    name="applicationDescription"
                    defaultValue="Pilotaż lokalnego programu wymiany wsparcia między opiekunami osób zależnych."
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="application-contact">Osoba do kontaktu</FieldLabel>
                  <Input id="application-contact" name="applicationContact" placeholder="Imię i e-mail" required />
                </Field>
              </FieldGroup>
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold">Czego brakuje</h3>
                <ul className="flex list-disc flex-col gap-2 pl-6 text-muted-foreground">
                  <li>potwierdzenia partnera do pilotażu,</li>
                  <li>szacunkowego budżetu,</li>
                  <li>planu pomiaru efektów.</li>
                </ul>
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start">
                Zapisz wersję roboczą
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Wątek rozmowy z ROPS</h2>
          <p className="text-muted-foreground">Możesz zadać pytanie osobie, która pomoże rozwinąć pomysł.</p>
        </div>
        <div className="flex flex-col gap-4">
          <Card size="sm">
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">ROPS</Badge>
                <time className="text-muted-foreground" dateTime="2026-10-03">
                  3 października 2026
                </time>
              </div>
              <p>
                Dobry początek. Warto sprawdzić, czy lokalny ośrodek pomocy społecznej może zostać partnerem
                pilotażu.
              </p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <form onSubmit={handleMessageSubmit} className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="message">Twoja wiadomość</FieldLabel>
                  <Textarea id="message" name="message" required placeholder="Napisz wiadomość do ROPS" />
                </Field>
                <div className="flex flex-wrap items-center gap-4">
                  <Button type="submit" size="lg">
                    Wyślij
                    <SendIcon data-icon="inline-end" aria-hidden />
                  </Button>
                  <span className="text-muted-foreground">Odpowiedź przyjdzie też e-mailem.</span>
                </div>
                {messageSent && (
                  <p className="flex items-center gap-2 font-medium" role="status">
                    <CheckCircle2Icon aria-hidden className="size-5 text-primary" />
                    Wiadomość została wysłana.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </article>
  )
}
