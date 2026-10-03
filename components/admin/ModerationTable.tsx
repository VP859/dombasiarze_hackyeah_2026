'use client'

import { useState, useTransition } from 'react'
import { Idea, Application } from '@/types/admin'
import { SolutionDraft } from '@/lib/ai'
import { generateDraftAction, updateSourceStatusAction } from '@/app/actions/admin-actions'
import { ConversionModal } from './ConversionModal'
import { Sparkles, Check, X, Loader2, FileText, Lightbulb } from 'lucide-react'

interface ModerationTableProps {
  ideas: Idea[]
  applications: Application[]
}

export function ModerationTable({ ideas, applications }: ModerationTableProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'ideas' | 'applications'>('ideas')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'idea' | 'application' } | null>(null)
  const [generatedDraft, setGeneratedDraft] = useState<SolutionDraft | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleGenerateAI = (id: string, type: 'idea' | 'application') => {
    setLoadingId(id)
    startTransition(async () => {
      try {
        const res = await generateDraftAction(id, type)
        setGeneratedDraft(res.draft)
        setSelectedItem({ id, type })
        setModalOpen(true)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Nie udało się wygenerować szkicu')
      } finally {
        setLoadingId(null)
      }
    })
  }

  const handleStatusChange = (id: string, type: 'idea' | 'application', status: 'approved' | 'rejected') => {
    startTransition(async () => {
      await updateSourceStatusAction(id, type, status)
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      {/* Zakładki */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-4 gap-6">
        <button
          onClick={() => setActiveTab('ideas')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'ideas'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Fiszki Pomysłów ({ideas.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'applications'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Wnioski Grantowe ({applications.length})
        </button>
      </div>

      {/* Tabela Zgłoszeń */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold uppercase text-xs">
            <tr>
              <th scope="col" className="px-6 py-3">Tytuł / Zgłaszający</th>
              <th scope="col" className="px-6 py-3">Treść / Problem</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Akcje Moderacji</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {activeTab === 'ideas'
              ? ideas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <div>{idea.title}</div>
                      <div className="text-xs text-slate-400 font-normal">{idea.author_email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{idea.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {idea.moderation_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleGenerateAI(idea.id, 'idea')}
                        disabled={loadingId === idea.id || isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {loadingId === idea.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        Konwertuj na Innowację
                      </button>
                      <button
                        onClick={() => handleStatusChange(idea.id, 'idea', 'approved')}
                        aria-label="Zatwierdź fiszkę"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-md"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(idea.id, 'idea', 'rejected')}
                        aria-label="Odrzuć fiszkę"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              : applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <div>{app.project_title}</div>
                      <div className="text-xs text-slate-400 font-normal">{app.applicant_name} ({app.applicant_email})</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{app.problem_statement}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleGenerateAI(app.id, 'application')}
                        disabled={loadingId === app.id || isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {loadingId === app.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        Konwertuj z AI
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedItem && generatedDraft && (
        <ConversionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          sourceId={selectedItem.id}
          sourceType={selectedItem.type}
          initialDraft={generatedDraft}
        />
      )}
    </div>
  )
}