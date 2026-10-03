'use client'

import React, { useState } from 'react'
import { generateGrantApplication } from '../app/actions/grant-generator'
import { GrantApplicationContent } from '@/lib/ai'
import { Loader2, Sparkles, FileText, Calendar, DollarSign, CheckCircle2 } from 'lucide-react'

interface Call {
  id: number
  title: string
  rules: string
  open_until?: string
}

interface GrantGeneratorFormProps {
  ideaId: string
  availableCalls: Call[]
}

export function GrantGeneratorForm({ ideaId, availableCalls }: GrantGeneratorFormProps) {
  const [selectedCallId, setSelectedCallId] = useState<number>(availableCalls[0]?.id || 1)
  const [loading, setLoading] = useState(false)
  const [application, setApplication] = useState<GrantApplicationContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await generateGrantApplication(ideaId, selectedCallId)
      setApplication(result)
    } catch (err: unknown) {
      console.error(err)
      setError((err as Error).message || 'Nie udało się wygenerować wniosku grantowego.')
    } finally {
      setLoading(false)
    }
  }

  const totalBudget = application?.budget_breakdown?.reduce(
    (sum, item) => sum + item.estimated_cost_pln,
    0
  ) || 0

  return (
    <div className="space-y-8">
      <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label htmlFor="callSelect" className="block text-sm font-semibold mb-2">
            Wybierz otwarty nabór grantowy (Call):
          </label>
          <select
            id="callSelect"
            value={selectedCallId}
            onChange={(e) => setSelectedCallId(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            {availableCalls.map((call) => (
              <option key={call.id} value={call.id}>
                {call.title} {call.open_until ? `(do ${call.open_until})` : ''}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || availableCalls.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Generowanie wniosku...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generuj Wniosek Grantowy
            </>
          )}
        </button>
      </form>

      {application && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-8">
          <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                Szkic Wniosku Wygenerowany
              </span>
              <h2 className="text-2xl font-bold mt-2">{application.project_title}</h2>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>

          <section>
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-2">
              <FileText className="h-5 w-5 text-blue-500" /> Streszczenie Projektu
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              {application.executive_summary}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-2">
              Spójność z Regulaminem Naboru
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              {application.problem_alignment}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-3">
              <Calendar className="h-5 w-5 text-blue-500" /> Harmonogram Działań
            </h3>
            <ul className="space-y-2">
              {application.detailed_schedule.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{idx + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-3">
              <DollarSign className="h-5 w-5 text-blue-500" /> Kosztorys Projektu
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border dark:border-slate-800">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="p-3 border dark:border-slate-800">Pozycja / Kategoria</th>
                    <th className="p-3 border dark:border-slate-800 text-right">Koszt Szacunkowy</th>
                  </tr>
                </thead>
                <tbody>
                  {application.budget_breakdown.map((item, idx) => (
                    <tr key={idx} className="border-b dark:border-slate-800">
                      <td className="p-3 border dark:border-slate-800">{item.item}</td>
                      <td className="p-3 border dark:border-slate-800 text-right font-mono">
                        {item.estimated_cost_pln.toLocaleString('pl-PL')} PLN
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold">
                    <td className="p-3 border dark:border-slate-800">SUMA RAZEM:</td>
                    <td className="p-3 border dark:border-slate-800 text-right font-mono text-blue-600 dark:text-blue-400">
                      {totalBudget.toLocaleString('pl-PL')} PLN
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
              Trwałość i Skalowalność
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              {application.sustainability_plan}
            </p>
          </section>
        </div>
      )}
    </div>
  )
}