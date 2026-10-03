import type { Metadata } from "next"
import { InfoIcon, PlusIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getChallenges } from "@/seed"
import { getDraftSolutions } from "@/app/actions/rops-panel-actions"
import { getNeedsFromDb } from "@/app/actions/needs-actions"

import { NeedsPanel } from "./needs-panel"
import { CallsTable, VerifyTable, type Call } from "./panel-tables"

export const metadata: Metadata = { title: "Panel ROPS" }

const MESSAGES = [
  {
    subject: "Pomysł: Klub młodych opiekunów",
    role: "Mieszkaniec",
    body: "Czy gmina może udostępnić salę na spotkania raz w tygodniu?",
    date: "3 paź 2026, 14:20",
    answered: false,
  },
  {
    subject: "Zgłoszenie: Skawina",
    role: "Samorząd",
    body: "Prosimy o kontakt w sprawie dopasowanych innowacji.",
    date: "3 paź 2026, 10:05",
    answered: false,
  },
  {
    subject: "Innowacja: Cyfrowy Senior",
    role: "Organizacja",
    body: "Dodaliśmy film z wdrożenia. Prosimy o aktualizację opisu.",
    date: "2 paź 2026, 16:40",
    answered: true,
  },
]

const CALLS: Call[] = [
  { title: "Małopolskie Innowacje Społeczne 2026", deadline: "2026-11-30", applications: 4, open: true },
  { title: "Inkubator pomysłów dla seniorów", deadline: "2026-08-15", applications: 11, open: false },
]

export default async function Page() {
  // Pobieramy TYLKO realne rekordy z bazy Supabase
  const toVerify = await getDraftSolutions()
  const realNeeds = await getNeedsFromDb()

  const newNeeds = realNeeds.filter((n) => n.status === "Nowe").length
  const unanswered = MESSAGES.filter((m) => !m.answered).length
  const stats = [
    { label: "Innowacje do weryfikacji", value: toVerify.length },
    { label: "Nowe zgłoszenia potrzeb", value: newNeeds },
    { label: "Wiadomości bez odpowiedzi", value: unanswered },
    { label: "Otwarte nabory", value: CALLS.filter((c) => c.open).length },
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
          <ul className="flex flex-col gap-4">
            {MESSAGES.map((message) => (
              <li key={message.subject}>
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
                      <Button type="button" size="sm" variant={message.answered ? "outline" : "default"}>
                        Odpowiedz<span className="sr-only">: {message.subject}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="nabory" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Nabory</h2>
              <p className="text-muted-foreground">Konkursy, do których autorzy pomysłów składają wnioski.</p>
            </div>
            <Button type="button">
              <PlusIcon data-icon="inline-start" aria-hidden />
              Dodaj nabór
            </Button>
          </div>
          <CallsTable calls={CALLS} />
        </TabsContent>
      </Tabs>
    </div>
  )
}