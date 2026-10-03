import type { Metadata } from "next"
import { InfoIcon, PlusIcon } from "lucide-react"

import { StageBadge } from "@/components/stage-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PreviewSheet, type DraftInnovation } from "./preview-sheet"

export const metadata: Metadata = { title: "Panel ROPS" }

// Wersja poglądowa: dane przykładowe (fikcyjne), przyciski jeszcze nic nie zapisują.
// Docelowo: solutions (status draft), needs, messages, calls/applications z Supabase.
const TO_VERIFY: DraftInnovation[] = [
  {
    title: "Sąsiedzka wypożyczalnia sprzętu rehabilitacyjnego",
    organization: "Stowarzyszenie Pomocna Dłoń (fikcyjne)",
    stage: "pomysł",
    source: "Kreator",
    date: "3 paź 2026",
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
    date: "2 paź 2026",
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
    source: "Kreator",
    date: "1 paź 2026",
    audience: "Nastolatki opiekujące się chorym członkiem rodziny",
    problem:
      "Część młodzieży codziennie opiekuje się chorym rodzicem lub rodzeństwem. Brakuje im czasu na naukę i kontaktów z rówieśnikami.",
    method:
      "Raz w tygodniu spotkania z psychologiem i rówieśnikami w podobnej sytuacji. W tym czasie wolontariusze zastępują młodych opiekunów w domu.",
    effects: ["Mniej przeciążenia i samotności", "Lepsze wyniki w nauce"],
    resources: ["Sala na spotkania", "Psycholog na 2 godziny w tygodniu", "Grupa wolontariuszy"],
  },
]

const NEEDS = [
  { gmina: "Skawina", text: "Seniorzy z sołectw nie mają jak dojechać do lekarza.", role: "Mieszkaniec", matches: 2, status: "Nowe" },
  { gmina: "Miechów", text: "Młodzież jest osamotniona, brakuje miejsca spotkań.", role: "Organizacja", matches: 3, status: "Nowe" },
  { gmina: "Gorlice", text: "Rodziny nie wiedzą, gdzie szukać pomocy przy opiece nad bliskimi.", role: "Samorząd", matches: 1, status: "W toku" },
  { gmina: "Limanowa", text: "Osoby starsze nie radzą sobie z e-usługami w urzędzie.", role: "Mieszkaniec", matches: 4, status: "W toku" },
  { gmina: "Bochnia", text: "Sąsiedzi chcą pomagać, ale nikt tego nie koordynuje.", role: "Organizacja", matches: 2, status: "Zamknięte" },
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

const CALLS = [
  { title: "Małopolskie Innowacje Społeczne 2026", deadline: "30 lis 2026", applications: 4, open: true },
  { title: "Inkubator pomysłów dla seniorów", deadline: "15 sie 2026", applications: 11, open: false },
]

const NEED_STATUS = { Nowe: "default", "W toku": "secondary", Zamknięte: "outline" } as const

const INNOWACJE = { one: "innowacja", few: "innowacje", many: "innowacji", other: "innowacji" }
const innowacje = (n: number) =>
  `${n} ${INNOWACJE[new Intl.PluralRules("pl").select(n) as keyof typeof INNOWACJE]}`

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Innowacja</TableHead>
                <TableHead>Etap</TableHead>
                <TableHead className="hidden md:table-cell">Źródło</TableHead>
                <TableHead className="hidden md:table-cell">Dodano</TableHead>
                <TableHead>
                  <span className="sr-only">Akcje</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TO_VERIFY.map((item) => (
                <TableRow key={item.title}>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-muted-foreground">{item.organization}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={item.stage} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{item.source}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.date}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <PreviewSheet item={item} />
                      <Button type="button" size="sm">
                        Opublikuj<span className="sr-only">: {item.title}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="zgloszenia" className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Zgłoszenia potrzeb</h2>
          <p className="text-muted-foreground">Problemy zgłoszone przez mieszkańców, organizacje i gminy.</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gmina i problem</TableHead>
                <TableHead className="hidden md:table-cell">Kto zgłosił</TableHead>
                <TableHead className="hidden md:table-cell">Dopasowania</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Akcje</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {NEEDS.map((need) => (
                <TableRow key={need.text}>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{need.gmina}</span>
                      <span className="text-muted-foreground">{need.text}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{need.role}</TableCell>
                  <TableCell className="hidden md:table-cell">{innowacje(need.matches)}</TableCell>
                  <TableCell>
                    <Badge variant={NEED_STATUS[need.status as keyof typeof NEED_STATUS]}>{need.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" size="sm" variant="outline">
                      Szczegóły<span className="sr-only">: {need.gmina}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nabór</TableHead>
                <TableHead className="hidden md:table-cell">Termin</TableHead>
                <TableHead className="hidden md:table-cell">Wnioski</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Akcje</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CALLS.map((call) => (
                <TableRow key={call.title}>
                  <TableCell className="font-medium whitespace-normal">{call.title}</TableCell>
                  <TableCell className="hidden md:table-cell">do {call.deadline}</TableCell>
                  <TableCell className="hidden md:table-cell">{call.applications}</TableCell>
                  <TableCell>
                    <Badge variant={call.open ? "default" : "outline"}>{call.open ? "Otwarty" : "Zamknięty"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" size="sm" variant="outline">
                      Wnioski<span className="sr-only">: {call.title}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
