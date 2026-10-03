"use client"

import { type FormEvent, useState, useTransition } from "react"
import { CalendarIcon, CheckCircle2Icon, CircleAlertIcon, Loader2Icon, MessageSquareIcon, SendIcon, UserIcon } from "lucide-react"

import { replyToMessageAction } from "@/app/actions/rops-panel-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
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

import { formatDate } from "./format"
import { Block, Facts } from "./sheet-parts"

// Bez adresu e-mail — ten zna tylko serwer (replyToMessageAction).
export type MessageItem = {
  id: string
  subject: string
  role: string
  body: string
  /** ISO, np. 2026-10-03 */
  date: string
  answered: boolean
}

export function MessagesList({ messages }: { messages: MessageItem[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((message) => (
        <li key={message.id}>
          <Card size="sm">
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{message.subject}</h3>
                {message.answered ? (
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Odpowiedziano</p>
                ) : (
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Bez odpowiedzi</p>
                )}
              </div>
              <p>{message.body}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {message.role} · {formatDate(message.date)}
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

function ReplySheet({ message }: { message: MessageItem }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const reply = String(new FormData(event.currentTarget).get("reply") ?? "")
    startTransition(async () => {
      const result = await replyToMessageAction(message.id, reply)
      setError(result.ok ? null : result.error)
      setSent(result.ok)
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setError(null)
          setSent(false)
        }
      }}
    >
      <SheetTrigger render={<Button type="button" size="sm" variant={message.answered ? "outline" : "default"} />}>
        {message.answered ? "Odpowiedz ponownie" : "Odpowiedz"}
        <span className="sr-only">: {message.subject}</span>
      </SheetTrigger>
      <SheetContent className="w-full! sm:max-w-xl!">
        <SheetHeader className="pr-16">
          <SheetTitle className="text-2xl leading-tight font-bold">{message.subject}</SheetTitle>
          <SheetDescription>Odpowiedź trafi na adres e-mail podany przez autora.</SheetDescription>
        </SheetHeader>

        <form id={`reply-${message.id}`} onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 text-base">
          <Facts
            items={[
              { icon: UserIcon, label: "Od", value: message.role },
              { icon: CalendarIcon, label: "Wpłynęło", value: formatDate(message.date) },
            ]}
          />

          <Block icon={MessageSquareIcon} title="Wiadomość">
            <p>{message.body}</p>
          </Block>

          {sent ? null : (
            <Field>
              <FieldLabel htmlFor={`reply-text-${message.id}`}>Twoja odpowiedź</FieldLabel>
              <Textarea id={`reply-text-${message.id}`} name="reply" required className="min-h-40" />
              <FieldDescription>Pisz prosto i krótko. Podpis ROPS dodamy sami.</FieldDescription>
            </Field>
          )}

          <div aria-live="polite">
            {sent && (
              <Alert role="status">
                <CheckCircle2Icon aria-hidden />
                <AlertTitle>Odpowiedź wysłana</AlertTitle>
                <AlertDescription>Autor dostanie ją na swój adres e-mail.</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <CircleAlertIcon aria-hidden />
                <AlertTitle>Nie wysłano odpowiedzi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>

        <SheetFooter className="flex-row justify-end gap-2 border-t">
          <SheetClose render={<Button type="button" variant="outline" />}>Zamknij</SheetClose>
          {!sent && (
            <Button type="submit" form={`reply-${message.id}`} disabled={pending}>
              {pending ? (
                <Loader2Icon data-icon="inline-start" aria-hidden className="motion-safe:animate-spin" />
              ) : (
                <SendIcon data-icon="inline-start" aria-hidden />
              )}
              {pending ? "Wysyłam…" : "Wyślij odpowiedź"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
