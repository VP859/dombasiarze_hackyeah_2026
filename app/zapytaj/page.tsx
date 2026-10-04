import type { Metadata } from "next"

import { getIdea } from "@/app/actions/ideas"
import { getSolutionById } from "@/app/actions/solutions"
import { MESSAGE_TOPICS, type MessageRecipient } from "@/seed"

import { MessageForm } from "./message-form"

export const metadata: Metadata = {
  title: "Zadaj pytanie",
  description: "Napisz do ROPS Kraków albo do mentora. Odpowiedź dostaniesz e-mailem.",
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

// Wejścia z innych stron: ?innowacja=<id>, ?pomysl=<id>, ?do=mentor, ?temat=…, ?tresc=…
export default async function Page({ searchParams }: PageProps<"/zapytaj">) {
  const params = await searchParams
  const solutionId = first(params.innowacja)
  const ideaId = first(params.pomysl)
  const topic = first(params.temat)

  const [solution, idea] = await Promise.all([
    solutionId ? getSolutionById(solutionId) : null,
    ideaId ? getIdea(ideaId) : null,
  ])
  const context = solution
    ? { about: solution.title, link: `/innowacja/${solution.id}`, topic: "Pytanie o innowację" }
    : idea
      ? { about: idea.title, link: `/kreator/${idea.id}`, topic: "Pomoc przy pomyśle" }
      : null

  const recipient: MessageRecipient = first(params.do) === "mentor" || idea ? "mentor" : "rops"

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Zadaj pytanie</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">W czym możemy pomóc?</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Napisz do pracowników ROPS Kraków albo do mentora — eksperta, który pomaga rozwijać pomysły i
          wdrażać innowacje. Odpowiedź wyślemy na Twój e-mail.
        </p>
      </div>

      <MessageForm
        context={context}
        defaults={{
          recipient,
          topic: MESSAGE_TOPICS.includes(topic) ? topic : (context?.topic ?? MESSAGE_TOPICS[0]),
          body: first(params.tresc).slice(0, 1000),
        }}
      />
    </div>
  )
}
