"use client"

import { useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { answerMessageAction } from "@/app/actions/rops-panel-actions"
import { Loader2 } from "lucide-react"

export type MessageItem = {
  id: string
  subject: string
  role: string
  body: string
  date: string
  answered: boolean
}

export function MessagesList({ messages }: { messages: MessageItem[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </ul>
  )
}

function MessageCard({ message }: { message: MessageItem }) {
  const [isPending, startTransition] = useTransition()

  const handleAnswer = () => {
    startTransition(async () => {
      try {
        await answerMessageAction(message.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : "Błąd aktualizacji")
      }
    })
  }

  return (
    <li>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {message.role} · {message.date}
            </span>
            <Button
              type="button"
              size="sm"
              variant={message.answered ? "outline" : "default"}
              disabled={isPending || message.answered}
              onClick={handleAnswer}
            >
              {isPending ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : null}
              {message.answered ? "Odpowiedziano" : "Odpowiedz"}
              <span className="sr-only">: {message.subject}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
