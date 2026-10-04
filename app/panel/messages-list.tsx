"use client"

import { type FormEvent, useState, useTransition } from "react"
import Link from "next/link"
import { CheckCircle2Icon, CircleAlertIcon, InboxIcon } from "lucide-react"

import { replyToMessageAction, type DbMessage, type ReplyState } from "@/app/actions/messages-actions"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
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
import { Textarea } from "@/components/ui/textarea"

// Lista pytań z odpowiadaniem — w Panelu ROPS (wszystkie) i na stronie mentora (tylko do mentorów).
export function MessagesList({ messages }: { messages: DbMessage[] }) {
  if (messages.length === 0) {
    return <EmptyState icon={InboxIcon} title="Brak pytań" description="Nowe pytania pojawią się tutaj." />
  }

  return (
    <ul className="flex flex-col gap-4">
      {messages.map((message) => (
        <li key={message.id}>
          <Card size="sm">
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{message.subject}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{message.recipient === "mentor" ? "Do mentora" : "Do ROPS"}</Badge>
                  {message.answered ? (
                    <Badge variant="outline">Odpowiedziano</Badge>
                  ) : (
                    <Badge>Bez odpowiedzi</Badge>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-line">{message.body}</p>
              {message.link && (
                <Link href={message.link} className="w-fit underline underline-offset-4">
                  Zobacz sprawę, której dotyczy pytanie
                </Link>
              )}

              {message.replyBody && (
                <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 p-3">
                  <span className="text-sm font-semibold text-muted-foreground">Odpowiedź:</span>
                  <p className="whitespace-pre-line">{message.replyBody}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-sm text-muted-foreground">
                  {message.role} · {message.date}
                </span>
                <ReplySheet message={message} />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}

const replyStatus = (result: Extract<ReplyState, { ok: true }>, hasEmail: boolean) =>
  result.emailSent
    ? "Odpowiedź zapisana i wysłana na e-mail autora."
    : hasEmail
      ? "Odpowiedź zapisana. E-mail nie wyszedł (wysyłka nie jest skonfigurowana) — autor zobaczy odpowiedź na stronie swojego pytania."
      : "Odpowiedź zapisana. Autor nie podał e-maila — zobaczy odpowiedź na stronie swojego pytania."

function ReplySheet({ message }: { message: DbMessage }) {
  const [open, setOpen] = useState(false)
  const [replyText, setReplyText] = useState(message.replyBody ?? "")
  const [result, setResult] = useState<ReplyState | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSendReply = (e: FormEvent) => {
    e.preventDefault()
    startTransition(async () => setResult(await replyToMessageAction(message.id, replyText)))
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setResult(null)
      }}
    >
      <SheetTrigger
        render={
          <Button type="button" size="sm" variant={message.answered ? "outline" : "default"}>
            {message.answered ? "Edytuj odpowiedź" : "Odpowiedz"}
            <span className="sr-only">: {message.subject}</span>
          </Button>
        }
      />
      <SheetContent className="w-full! sm:max-w-xl!">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Odpowiedź na pytanie</SheetTitle>
          <SheetDescription>
            {message.subject} ({message.role})
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSendReply} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4">
            <span className="text-sm font-semibold text-muted-foreground">Pytanie:</span>
            <p className="whitespace-pre-line">{message.body}</p>
          </div>

          <Field>
            <FieldLabel htmlFor={`reply-${message.id}`}>Twoja odpowiedź</FieldLabel>
            <Textarea
              id={`reply-${message.id}`}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-40"
            />
          </Field>

          <div aria-live="polite">
            {result && (
              <Alert variant={result.ok ? "default" : "destructive"}>
                {result.ok ? <CheckCircle2Icon aria-hidden /> : <CircleAlertIcon aria-hidden />}
                <AlertDescription>{result.ok ? replyStatus(result, message.hasEmail) : result.error}</AlertDescription>
              </Alert>
            )}
          </div>

          <SheetFooter className="mt-auto border-t px-0">
            <SheetClose render={<Button type="button" variant="outline">{result?.ok ? "Zamknij" : "Anuluj"}</Button>} />
            <Button type="submit" disabled={isPending || !replyText.trim()}>
              {isPending ? "Wysyłanie…" : "Wyślij odpowiedź"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
