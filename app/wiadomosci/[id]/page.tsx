import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ClockIcon, MessageSquareReplyIcon } from "lucide-react"

import { getMessage } from "@/app/actions/messages-actions"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

// Adres sprawy zna tylko autor (link po wysłaniu i w e-mailu) — nie indeksujemy go.
export const metadata: Metadata = { title: "Twoje pytanie", robots: { index: false } }

export default async function Page({ params }: PageProps<"/wiadomosci/[id]">) {
  const { id } = await params
  const message = await getMessage(id)
  if (!message) notFound()

  const from = message.recipient === "mentor" ? "mentora" : "ROPS Kraków"
  const date = new Date(message.created_at).toLocaleString("pl-PL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  })

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Twoje pytanie do {from}</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">{message.subject}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {message.answered ? <Badge>Jest odpowiedź</Badge> : <Badge variant="outline">Czeka na odpowiedź</Badge>}
          <span className="text-muted-foreground">Wysłano {date}</span>
        </div>
        {message.link && (
          <Link href={message.link} className="w-fit underline underline-offset-4">
            Zobacz sprawę, której dotyczy pytanie
          </Link>
        )}
      </div>

      <section className="flex flex-col gap-2 rounded-2xl border p-6">
        <h2 className="font-semibold text-muted-foreground">Twoje pytanie</h2>
        <p className="whitespace-pre-line">{message.body}</p>
      </section>

      {message.answered && message.reply_body ? (
        <section className="flex flex-col gap-2 rounded-2xl bg-muted p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <MessageSquareReplyIcon aria-hidden className="size-5 text-primary" />
            Odpowiedź {from}
          </h2>
          <p className="whitespace-pre-line">{message.reply_body}</p>
        </section>
      ) : (
        <p className="flex gap-3 text-muted-foreground">
          <ClockIcon aria-hidden className="mt-1 size-5 shrink-0" />
          Odpowiedź pojawi się na tej stronie i przyjdzie na Twój e-mail. Zapisz adres tej strony, żeby do niej
          wrócić.
        </p>
      )}

      <Link href="/zapytaj" className={buttonVariants({ variant: "outline", size: "lg", className: "self-start" })}>
        Zadaj kolejne pytanie
      </Link>
    </article>
  )
}
