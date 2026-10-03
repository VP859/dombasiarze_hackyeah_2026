import type { Metadata } from "next"
import { InfoIcon, PlusIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getChallenges } from "@/seed"

import { NeedsPanel, type Need } from "./needs-panel"
import { CallsTable, VerifyTable, type Call } from "./panel-tables"
import { type DraftInnovation } from "./preview-sheet"

export const metadata: Metadata = { title: "Panel ROPS" }

// Wersja poglądowa: dane przykładowe (fikcyjne), przyciski jeszcze nic nie zapisują.
// Docelowo: solutions (status draft), needs, messages, calls/applications z Supabase.
const TO_VERIFY: DraftInnovation[] = [
  {
    title: "Sąsiedzka wypożyczalnia sprzętu rehabilitacyjnego",
    organization: "Stowarzyszenie Pomocna Dłoń (fikcyjne)",
    stage: "pomysł",
    source: "Zgłoś rozwiązanie",
    date: "2026-10-03",
    audience: "Osoby po urazach, seniorzy i ich opiekunowie",
    problem:
      "Po wyjściu ze szpitala wiele osób potrzebuje kul, balkonika albo łóżka na kilka tygodni. Zakup jest drogi, a w małych gminach nie ma gdzie tego pożyczyć.",
    method:
      "Mieszkańcy oddają nieużywany sprzęt do punktu w bibliotece lub świetlicy. Wolontariusz go sprawdza i wypożycza bezpłatnie na określony czas.",
    effects: [
      "Szybszy powrót do sprawności bez kosztów dla rodziny",
      "Mniej sprzętu zalegającego w piwnicach",
      "Nowe kontakty między sąsiadami",
    ],
    resources: ["Pomieszczenie na sprzęt", "Wolontariusz na 2 dyżury w tygodniu", "Prosty rejestr wypożyczeń"],
  },
  {
    title: "Wirtualny asystent seniora w urzędzie gminy",
    organization: "Fundacja Cyfrowe Jutro (fikcyjna)",
    stage: "pilotaż",
    source: "Organizacja",
    date: "2026-10-02",
    audience: "Osoby 65+, które załatwiają sprawy w urzędzie",
    problem:
      "Seniorzy gubią się w formularzach i e-usługach. Urzędnicy nie mają czasu, żeby każdemu tłumaczyć krok po kroku.",
    method:
      "W urzędzie stoi tablet z prostym asystentem, który dużą czcionką i głosem prowadzi przez najczęstsze sprawy. W trudniejszych przypadkach wzywa pracownika.",
    effects: ["Krótsze kolejki przy okienkach", "Seniorzy częściej załatwiają sprawy samodzielnie"],
    resources: ["Tablet ze stojakiem", "Licencja na asystenta", "Szkolenie dla 2 urzędników"],
  },
  {
    title: "Klub młodych opiekunów",
    organization: "GOPS w Przykładowie (fikcyjny)",
    stage: "pomysł",
    source: "Zgłoś rozwiązanie",
    date: "2026-10-01",
    audience: "Nastolatki opiekujące się chorym członkiem rodziny",
    problem:
      "Część młodzieży codziennie opiekuje się chorym rodzicem lub rodzeństwem. Brakuje im czasu na naukę i kontaktów z rówieśnikami.",
    method:
      "Raz w tygodniu spotkania z psychologiem i rówieśnikami w podobnej sytuacji. W tym czasie wolontariusze zastępują młodych opiekunów w domu.",
    effects: ["Mniej przeciążenia i samotności", "Lepsze wyniki w nauce"],
    resources: ["Sala na spotkania", "Psycholog na 2 godziny w tygodniu", "Grupa wolontariuszy"],
  },
]

const NEEDS: Need[] = [
  {
    id: "n1",
    gmina: "Skawina",
    text: "Seniorzy z sołectw nie mają jak dojechać do lekarza.",
    role: "resident",
    challenges: ["dostep-do-uslug", "starzenie"],
    audiences: ["Seniorzy"],
    status: "Nowe",
    matches: 2,
    date: "2026-10-03",
    email: "anna.k@example.com",
  },
  {
    id: "n2",
    gmina: "Miechów",
    text: "Młodzież jest osamotniona, brakuje miejsca spotkań.",
    role: "ngo",
    challenges: ["samotnosc", "zdrowie-psychiczne"],
    audiences: ["Dzieci i młodzież"],
    status: "Nowe",
    matches: 3,
    date: "2026-10-03",
    email: "fundacja.razem@example.com",
  },
  {
    id: "n3",
    gmina: "Gorlice",
    text: "Rodziny nie wiedzą, gdzie szukać pomocy przy opiece nad bliskimi.",
    role: "official",
    challenges: ["koordynacja"],
    audiences: ["Rodziny"],
    status: "W toku",
    matches: 1,
    date: "2026-10-02",
    email: "ops.gorlice@example.com",
  },
  {
    id: "n4",
    gmina: "Limanowa",
    text: "Osoby starsze nie radzą sobie z e-usługami w urzędzie.",
    role: "resident",
    challenges: ["wykluczenie-cyfrowe", "starzenie"],
    audiences: ["Seniorzy"],
    status: "W toku",
    matches: 4,
    date: "2026-10-02",
    email: "jan.m@example.com",
  },
  {
    id: "n5",
    gmina: "Bochnia",
    text: "Sąsiedzi chcą pomagać, ale nikt tego nie koordynuje.",
    role: "ngo",
    challenges: ["koordynacja", "samotnosc"],
    audiences: ["Wszyscy mieszkańcy"],
    status: "Zamknięte",
    matches: 2,
    date: "2026-09-30",
    email: "sasiedzi.bochnia@example.com",
  },
  {
    id: "n6",
    gmina: "Nowy Targ",
    text: "Osoby z niepełnosprawnościami nie mają transportu na zajęcia.",
    role: "resident",
    challenges: ["dostep-do-uslug"],
    audiences: ["Osoby z niepełnosprawnościami"],
    status: "Nowe",
    matches: 1,
    date: "2026-10-01",
    email: "ewa.n@example.com",
  },
  {
    id: "n7",
    gmina: "Dąbrowa Tarnowska",
    text: "Młodzi wyjeżdżają, w sołectwach zostają głównie seniorzy.",
    role: "official",
    challenges: ["zmiany-osadnicze", "starzenie"],
    audiences: ["Seniorzy", "Wszyscy mieszkańcy"],
    status: "Nowe",
    matches: 2,
    date: "2026-10-01",
    email: "urzad.dabrowa@example.com",
  },
  {
    id: "n8",
    gmina: "Wieliczka",
    text: "Nastolatki czekają miesiącami na wizytę u psychologa.",
    role: "resident",
    challenges: ["zdrowie-psychiczne"],
    audiences: ["Dzieci i młodzież"],
    status: "W toku",
    matches: 3,
    date: "2026-09-29",
    email: "rodzic.w@example.com",
  },
]

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

export default function Page() {
  const newNeeds = NEEDS.filter((n) => n.status === "Nowe").length
  const unanswered = MESSAGES.filter((m) => !m.answered).length
  const stats = [
    { label: "Innowacje do weryfikacji", value: TO_VERIFY.length },
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
        <Alert>
          <InfoIcon aria-hidden />
          <AlertDescription>Wersja poglądowa: dane są przykładowe, a przyciski jeszcze nic nie zapisują.</AlertDescription>
        </Alert>
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
            Do weryfikacji <Badge variant="secondary">{TO_VERIFY.length}</Badge>
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
          <VerifyTable items={TO_VERIFY} />
        </TabsContent>

        <TabsContent value="zgloszenia" className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Zgłoszenia potrzeb</h2>
          <p className="text-muted-foreground">
            Problemy zgłoszone przez mieszkańców, organizacje i gminy. Filtruj je po wyzwaniu, grupie i statusie.
          </p>
          <NeedsPanel needs={NEEDS} challenges={getChallenges()} />
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
