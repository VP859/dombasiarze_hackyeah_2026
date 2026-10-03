'use client';

import { useActionState } from 'react';
import { processNeedAction } from '@/app/actions/matchmaking';

export default function MatchmakingForm() {
  const [state, formAction, isPending] = useActionState(processNeedAction, null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Zgłoś potrzebę lub problem społeczny
        </h2>
        <p className="text-slate-600 mb-6">
          System AI przeanalizuje Twoje zgłoszenie, dopasuje gotowe innowacje społeczne oraz odnajdzie podobne inicjatywy w regionie.
        </p>

        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Opis potrzeby / problemu *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              placeholder="Opisz wyzwanie w Twojej gminie, np. Brak zajęć aktywizujących dla seniorów w małych sołectwach..."
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gmina" className="block text-sm font-medium text-slate-700 mb-1">
                Gmina *
              </label>
              <input
                type="text"
                id="gmina"
                name="gmina"
                required
                placeholder="np. Skawina"
                className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="author_email" className="block text-sm font-medium text-slate-700 mb-1">
                Adres e-mail *
              </label>
              <input
                type="email"
                id="author_email"
                name="author_email"
                required
                placeholder="jan.kowalski@example.pl"
                className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="author_role" className="block text-sm font-medium text-slate-700 mb-1">
              Rola zgłaszającego
            </label>
            <select
              id="author_role"
              name="author_role"
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="resident">Mieszkaniec / Mieszkanka</option>
              <option value="official">Przedstawiciel Samorządu / Gminy</option>
              <option value="ngo">Przedstawiciel NGO / Organizacji</option>
            </select>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analizowanie i szukanie dopasowań...</span>
              </>
            ) : (
              <span>Prześlij zgłoszenie i znajdź rozwiązania</span>
            )}
          </button>
        </form>
      </div>

      {state?.success && state.data && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Analiza Asystenta AI
              </span>
              <span className="text-sm font-medium text-slate-500">
                Pewność: {Math.round(state.data.analysis.confidence_score * 100)}%
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Kategoria: {state.data.analysis.category}
            </h3>

            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Zidentyfikowane kluczowe wyzwania:</p>
              <div className="flex flex-wrap gap-2">
                {state.data.analysis.key_challenges.map((challenge, idx) => (
                  <span key={idx} className="bg-white border border-blue-200 text-blue-900 text-xs px-3 py-1.5 rounded-md font-medium">
                    • {challenge}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rekomendowane Działanie</p>
              <p className="text-slate-800 text-sm font-medium">{state.data.analysis.suggested_action}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <span>Gotowe Innowacje Społeczne</span>
              <span className="text-sm font-normal text-slate-500">({state.data.matchedSolutions.length})</span>
            </h3>

            {state.data.matchedSolutions.length === 0 ? (
              <p className="text-slate-500 italic bg-slate-50 p-4 rounded-lg">Brak bezpośrednio dopasowanych innowacji w bazie.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {state.data.matchedSolutions.map((solution) => (
                  <div key={solution.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-300 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-blue-700">{solution.title}</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {Math.round(solution.similarity * 100)}% dopasowania
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm mb-3">
                      <strong>Problem:</strong> {solution.problem}
                    </p>
                    <p className="text-slate-600 text-sm">
                      <strong>Metoda rozwiązywania:</strong> {solution.method}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <span>Podobne Zgłoszenia w Regionie</span>
              <span className="text-sm font-normal text-slate-500">({state.data.matchedNeeds.length})</span>
            </h3>

            {state.data.matchedNeeds.length === 0 ? (
              <p className="text-slate-500 italic bg-slate-50 p-4 rounded-lg">Brak innych zgłoszeń o podobnej tematyce.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {state.data.matchedNeeds.map((need) => (
                  <div key={need.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Gmina: {need.gmina}</span>
                      <span className="text-xs font-semibold text-slate-600">
                        Podobieństwo: {Math.round(need.similarity * 100)}%
                      </span>
                    </div>
                    <p className="text-slate-800 text-sm">{need.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}