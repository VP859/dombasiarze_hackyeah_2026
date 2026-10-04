import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getChallenges } from "@/seed"
import { getDraftSolutions } from "@/app/actions/rops-panel-actions"
import { getNeedsFromDb } from "@/app/actions/needs-actions"
import { getMessagesFromDb } from "@/app/actions/messages-actions"
import { getCallsFromDb } from "@/app/actions/calls-actions"

import { NeedsPanel } from "./needs-panel"
import { CallsTable } from "./panel-tables"
import { VerifyTable } from "./panel-tables"
import { MessagesList } from "./messages-list"
import { AddCallButton } from "./add-call-button"

export const metadata: Metadata = { title: "Panel ROPS" }

export default async function Page() {
  const toVerify = await getDraftSolutions()
  const realNeeds = await getNeedsFromDb()
  const realMessages = await getMessagesFromDb()
  const realCalls = await getCallsFromDb()

  const newNeeds = realNeeds.filter((n) => n.status === "Nowe").length
  const unanswered = realMessages.filter((m) => !m.answered).length
  const stats = [
    { label: "Innowacje do weryfikacji", value: toVerify.length },
    { label: "Nowe zgłoszenia potrzeb", value: newNeeds },
    { label: "Wiadomości bez odpowiedzi", value: unanswered },
    { label: "Otwarte nabory", value: realCalls.filter((c) => c.open).length },
  ]

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">ROPS Kraków</p>
        <h1 className="text-4xl font-bold md:text-5xl">Panel ROPS</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Weryfikuj nowe innowacje, odpowiadaj na zgłoszenia i wiadomości, prowadź nabory.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-6 border-y py-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1">
            <dt className="text-muted-foreground">{stat.label}</dt>
            <dd className="font-heading text-4xl font-semibold tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <Tabs defaultValue="weryfikacja" className="gap-6">
        <TabsList aria-label="Sekcje panelu">
          <TabsTrigger value="weryfikacja">
            Do weryfikacji <Badge variant="secondary">{toVerify.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="zgloszenia">
            Zgłoszenia <Badge variant="secondary">{newNeeds}</Badge>
          </TabsTrigger>
          <TabsTrigger value="wiadomosci">
            Wiadomości <Badge variant="secondary">{unanswered}</Badge>
          </TabsTrigger>
          <TabsTrigger value="nabory">Nabory</TabsTrigger>
        </TabsList>

        <TabsContent value="weryfikacja" className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Innowacje do weryfikacji</h2>
          <p className="text-muted-foreground">
            Sprawdź opis i zdecyduj, czy innowacja trafi do biblioteki.
          </p>
          <VerifyTable items={toVerify} />
        </TabsContent>

        <TabsContent value="zgloszenia" className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Zgłoszenia potrzeb</h2>
          <p className="text-muted-foreground">
            Problemy zgłoszone przez mieszkańców, organizacje i gminy. Filtruj je po wyzwaniu, grupie i statusie.
          </p>
          <NeedsPanel needs={realNeeds} challenges={getChallenges()} />
        </TabsContent>

        <TabsContent value="wiadomosci" className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Wiadomości</h2>
          <p className="text-muted-foreground">Pytania od autorów pomysłów, gmin i organizacji.</p>
          <MessagesList messages={realMessages} />
        </TabsContent>

        <TabsContent value="nabory" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Nabory</h2>
              <p className="text-muted-foreground">Konkursy, do których autorzy pomysłów składają wnioski.</p>
            </div>
            <AddCallButton />
          </div>
          <CallsTable calls={realCalls} />
        </TabsContent>
      </Tabs>
    </div>
  )
}