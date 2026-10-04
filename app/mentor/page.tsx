import type { Metadata } from "next"

import { getMessagesFromDb } from "@/app/actions/messages-actions"
import { MessagesList } from "@/app/panel/messages-list"

export const metadata: Metadata = { title: "Pytania do mentorów" }

// ponytail: bez logowania stronę otworzy każdy; przy kontach ekspertów — dostęp tylko dla roli „Ekspert”.
export default async function Page() {
  const messages = await getMessagesFromDb("mentor")
  const waiting = messages.filter((m) => !m.answered).length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Strefa mentora</p>
        <h1 className="text-4xl font-bold md:text-5xl">Pytania do mentorów</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Innowatorzy, organizacje i gminy proszą o radę. Twoja odpowiedź trafi do nich e-mailem i na
          stronę ich pytania.
        </p>
        <p className="font-medium" aria-live="polite">
          Czeka na odpowiedź: {waiting}
        </p>
      </div>
      <MessagesList messages={messages} />
    </div>
  )
}
