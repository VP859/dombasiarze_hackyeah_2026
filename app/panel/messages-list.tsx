"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

import { replyToMessageAction, type DbMessage } from "@/app/actions/messages-actions"

export function MessagesList({ messages }: { messages: DbMessage[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((message) => (
        <li key={message.id || message.subject}>
          <Card size="sm">
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{message.subject}</h3>
                {message.answered ? (
                  <Badge variant="outline">Odpowiedziano</Badge>
                ) : (
                  <Badge>Bez odpowiedzi</Badge>
                )}
              </div>
              <p>{message.body}</p>
              
              {message.replyBody && (
                <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
                  <span className="font-semibold text-xs text-muted-foreground uppercase">Twoja odpowiedź:</span>
                  <p>{message.replyBody}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-muted-foreground text-sm">
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

function ReplySheet({ message }: { message: DbMessage }) {
  const [open, setOpen] = useState(false)
  const [replyText, setReplyText] = useState(message.replyBody || "")
  const [isPending, startTransition] = useTransition()

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !message.id) return

    startTransition(async () => {
      try {
        await replyToMessageAction(message.id, replyText)
        setOpen(false)
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Błąd wysyłania odpowiedzi")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button type="button" size="sm" variant={message.answered ? "outline" : "default"}>
          {message.answered ? "Edytuj odpowiedź" : "Odpowiedz"}
          <span className="sr-only">: {message.subject}</span>
        </Button>
      } />
      <SheetContent className="w-full! sm:max-w-xl!">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Odpowiedź na wiadomość</SheetTitle>
          <SheetDescription>{message.subject} ({message.role})</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSendReply} className="flex flex-1 flex-col gap-4 py-4">
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Treść zapytania:</span>
            <p className="text-sm leading-relaxed">{message.body}</p>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="reply" className="text-sm font-semibold">
              Treść Twojej odpowiedzi:
            </label>
            <textarea
              id="reply"
              required
              rows={6}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Wpisz treść odpowiedzi..."
              className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-primary dark:bg-slate-800"
            />
          </div>

          <SheetFooter className="pt-4 border-t">
            <SheetClose render={<Button type="button" variant="outline">Anuluj</Button>} />
            <Button type="submit" disabled={isPending || !replyText.trim()}>
              {isPending ? "Wysyłanie..." : "Wyślij odpowiedź"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}