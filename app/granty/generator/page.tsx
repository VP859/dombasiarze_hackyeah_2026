import { getSupabaseAdmin } from "@/lib/supabase"
import { GrantGeneratorForm } from "../../../components/grant-generator"
import { AlertCircle, Lightbulb } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ ideaId?: string }>
}

export default async function GrantGeneratorPage({ searchParams }: PageProps) {
  const { ideaId } = await searchParams
  const supabase = getSupabaseAdmin()

  let idea = null
  if (ideaId && ideaId !== "local-demo-idea-id") {
    const { data } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", ideaId)
      .single()
    idea = data
  }

  const { data: calls } = await supabase
    .from("calls")
    .select("id, title, rules, open_until")
    .order("id", { ascending: false })

  const fallbackCalls = [
    {
      id: 1,
      title: "Małopolskie Innowacje Społeczne 2026 — Edycja Jesień",
      rules:
        "Dofinansowanie do 50 000 PLN na pilotaż rozwiązań wspierających seniorów i przeciwdziałających wykluczeniu cyfrowemu w gminach Małopolski.",
      open_until: "2026-11-30",
    },
  ]

  const availableCalls = calls && calls.length > 0 ? calls : fallbackCalls

  if (!ideaId) {
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="text-2xl font-bold">Brak identyfikatora pomysłu</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Nie wskazano pomysłu, dla którego ma zostać wygenerowany wniosek
          grantowy.
        </p>
        <Link
          href="/kreator"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Lightbulb className="h-4 w-4" />
          Przejdź do Kreatora Pomysłów
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Nagłówek Generatora */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Generator Wniosku Grantowego
          </h1>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400">
            ID Pomysłu: {ideaId}
          </span>
        </div>

        {idea ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/60">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              {idea.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
              {idea.essence}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Automatyczne dopasowywanie i tworzenie dokumentacji aplikacyjnej na
            podstawie analizy AI i Canwy ROPS.
          </p>
        )}
      </div>

      <GrantGeneratorForm ideaId={ideaId} availableCalls={availableCalls} />
    </div>
  )
}
