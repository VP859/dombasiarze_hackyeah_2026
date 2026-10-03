'use client'

import { useState, useTransition } from 'react'
import { SolutionDraft } from '@/lib/ai'
import { finalizeAndPublishSolutionAction } from '@/app/actions/admin-actions'
import { Sparkles, Check, Loader2, X, AlertCircle } from 'lucide-react'

interface ConversionModalProps {
  isOpen: boolean
  onClose: () => void
  sourceId: string
  sourceType: 'idea' | 'application'
  initialDraft: SolutionDraft
}

export function ConversionModal({
  isOpen,
  onClose,
  sourceId,
  sourceType,
  initialDraft,
}: ConversionModalProps) {
  const [formData, setFormData] = useState<SolutionDraft>(initialDraft)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handlePublish = () => {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await finalizeAndPublishSolutionAction({
          sourceId,
          sourceType,
          solutionData: formData,
        })
        onClose()
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Wystąpił błąd podczas publikacji.')
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col focus:outline-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Weryfikacja i Edycja Karty Innowacji (AI Draft)
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Zamknij okno"
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Tytuł Innowacji
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Skrócony Opis (Summary)
            </label>
            <textarea
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Grupa Docelowa
              </label>
              <input
                type="text"
                value={formData.target_group}
                onChange={(e) => setFormData({ ...formData, target_group: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Zasięg Terytorialny
              </label>
              <input
                type="text"
                value={formData.spatial_scope}
                onChange={(e) => setFormData({ ...formData, spatial_scope: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Pełny Opis Rozwiązania
            </label>
            <textarea
              rows={4}
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Anuluj
          </button>
          <button
            onClick={handlePublish}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition disabled:opacity-50 focus:ring-2 focus:ring-indigo-500"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generowanie wektora i publikacja...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Zatwierdź i Opublikuj w Bibliotece
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}