import type { Metadata } from "next"
import { InfoIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getChallenges } from "@/seed"
import { getSupabaseAdmin } from "@/lib/supabase"

import { NeedsPanel, type Need } from "@/app/panel/needs-panel"
import { CallsTable, VerifyTable, type Call } from "@/app/panel/panel-tables"
import { type DraftInnovation } from "@/app/panel/preview-sheet"
import { MessagesList, type MessageItem } from "@/app/panel/messages-list"
import { AddCallButton } from "@/app/panel/add-call-button"

export const metadata: Metadata = { title: "Panel ROPS" }

export default async function Page() {
  const supabaseAdmin = getSupabaseAdmin()

  // Pobranie danych w czasie rzeczywistym z Supabase
  const [
    { data: solutionsData },
    { data: needsData },
    { data: messagesData },
    { data: callsData },
  ] = await Promise.all([
    supabaseAdmin
      .from("solutions")
      .select("*")
      .neq("status", "published")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("needs")
      .select("*")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("calls")
      .select("*")
      .order("deadline", { ascending: false }),
  ])

  const TO_VERIFY: DraftInnovation[] = (solutionsData || []).map((s) => ({
    id: s.id,
    title: s.title || "Bez tytułu",
    organization: s.organization || "Zgłoszenie publiczne",
    stage: s.stage || "pomysł",
    source: s.source_idea_id ? "Fiszka pomysłu" : "Zgłoś rozwiązanie",
    date: s.created_at ? s.created_at.split("T")[0] : "2026-10-03",
    audience: s.target_group || "Nieokreślona",
    problem: s.summary || s.full_description || "Brak opisu",
    method: s.full_description || "Brak metody",
    effects: s.key_benefits || [],
    resources: s.implementation_steps || [],
  }))

  const NEEDS: Need[] = (needsData || []).map((n) => ({
    id: n.id,
    gmina: n.gmina,
    text: n.text,
    role: n.role,
    challenges: n.challenges || [],
    audiences: n.audiences || [],
    status: n.status || "Nowe",
    matches: n.matches || 0,
    date: n.created_at ? n.created_at.split("T")[0] : "2026-10-03",
    email: n.email,
  }))

  const MESSAGES: MessageItem[] = (messagesData || []).map((m) => ({
    id: m.id,
    subject: m.subject,
    role: m.role,
    body: m.body,
    date: m.created_at
      ? new Date(m.created_at).toLocaleString("pl-PL")
      : "Brak daty",
    answered: m.answered,
  }))

  const CALLS: Call[] = (callsData || []).map((c) => ({
    id: c.id,
    title: c.title,
    deadline: c.deadline,
    applications: c.applications || 0,
    open: c.open,
  }))

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
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">
          ROPS Kraków
        </p>
        <h1 className="text-4xl font-bold md:text-5xl">Panel ROPS</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Weryfikuj nowe innowacje, odpowiadaj na zgłoszenia i wiadomości,
          prowadź nabory.
        </p>
        <Alert>
          <InfoIcon aria-hidden />
          <AlertDescription>
            System połączony z bazą Supabase: dane są pobierane w czasie
            rzeczywistym, a akcje zapisują zmiany w bazie danych.
          </AlertDescription>
        </Alert>
      </div>

      <dl className="grid grid-cols-2 gap-6 border-y py-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1">
            <dt className="text-muted-foreground">{stat.label}</dt>
            <dd className="font-heading text-4xl font-semibold tracking-tight">
              {stat.value}
            </dd>
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
            Problemy zgłoszone przez mieszkańców, organizacje i gminy. Filtruj
            je po wyzwaniu, grupie i statusie.
          </p>
          <NeedsPanel needs={NEEDS} challenges={getChallenges()} />
        </TabsContent>

        <TabsContent value="wiadomosci" className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Wiadomości</h2>
          <p className="text-muted-foreground">
            Pytania od autorów pomysłów, gmin i organizacji.
          </p>
          <MessagesList messages={MESSAGES} />
        </TabsContent>

        <TabsContent value="nabory" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Nabory</h2>
              <p className="text-muted-foreground">
                Konkursy, do których autorzy pomysłów składają wnioski.
              </p>
            </div>
            <AddCallButton />
          </div>
          <CallsTable calls={CALLS} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
