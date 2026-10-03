'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adaptInnovationForGmina, AdaptationResult } from '@/app/actions/adapt-innovation';
import { ArrowLeft, Wand2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdaptInnovationPage() {
  const params = useParams();
  const solutionId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdaptationResult | null>(null);

  const [formData, setFormData] = useState({
    gminaName: '',
    population: '',
    type: 'miejsko-wiejska',
    budgetConstraint: 'Niski budżet (wymagane dofinansowanie)',
    specificChallenges: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adaptInnovationForGmina(solutionId, formData);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Wystąpił nieoczekiwany błąd.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Link
          href={`/eksploracja-innowacji/${solutionId}`}
          className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-semibold focus:ring-2 focus:ring-blue-700 rounded px-2 py-1 outline-none"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Anuluj i wróć do opisu
        </Link>

        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Wand2 className="w-8 h-8 text-indigo-700" aria-hidden="true" />
            Middleman Innowacji – Dostosuj rozwiązanie do swojej gminy
          </h1>
          <p className="mt-2 text-slate-700">
            Uzupełnij specyfikę swojego samorządu. Nasz asystent AI przygotuje dedykowaną analizę i plan krok-po-kroku.
          </p>
        </header>

        {/* Gmina form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gminaName" className="block text-sm font-bold text-slate-900 mb-1">
                Nazwa Gminy / Samorządu *
              </label>
              <input
                id="gminaName"
                type="text"
                required
                value={formData.gminaName}
                onChange={(e) => setFormData({ ...formData, gminaName: e.target.value })}
                placeholder="np. Gmina Miechów"
                className="w-full p-2.5 rounded-lg border border-slate-400 text-slate-900 focus:ring-2 focus:ring-indigo-700 outline-none"
              />
            </div>

            <div>
              <label htmlFor="population" className="block text-sm font-bold text-slate-900 mb-1">
                Szacowana liczba mieszkańców *
              </label>
              <input
                id="population"
                type="text"
                required
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                placeholder="np. 12 500"
                className="w-full p-2.5 rounded-lg border border-slate-400 text-slate-900 focus:ring-2 focus:ring-indigo-700 outline-none"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-bold text-slate-900 mb-1">
                Typ Gminy *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-400 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-700 outline-none"
              >
                <option value="wiejska">Wiejska</option>
                <option value="miejsko-wiejska">Miejsko-wiejska</option>
                <option value="miejska">Miejska</option>
                <option value="powiat">Powiat / Związek Gmin</option>
              </select>
            </div>

            <div>
              <label htmlFor="budgetConstraint" className="block text-sm font-bold text-slate-900 mb-1">
                Mawariaty / Możliwości Budżetowe *
              </label>
              <input
                id="budgetConstraint"
                type="text"
                required
                value={formData.budgetConstraint}
                onChange={(e) => setFormData({ ...formData, budgetConstraint: e.target.value })}
                placeholder="np. do 50 000 zł, tylko środki własne"
                className="w-full p-2.5 rounded-lg border border-slate-400 text-slate-900 focus:ring-2 focus:ring-indigo-700 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="specificChallenges" className="block text-sm font-bold text-slate-900 mb-1">
              Specyficzne lokalne wyzwania lub bariery
            </label>
            <textarea
              id="specificChallenges"
              rows={3}
              value={formData.specificChallenges}
              onChange={(e) => setFormData({ ...formData, specificChallenges: e.target.value })}
              placeholder="np. brak cyfryzacji wśród seniorek, rozproszone sołectwa, brak transportu publicznego"
              className="w-full p-2.5 rounded-lg border border-slate-400 text-slate-900 focus:ring-2 focus:ring-indigo-700 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 focus:ring-4 focus:ring-indigo-300 outline-none text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                Gemini analizuje uwarunkowania gminy...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" aria-hidden="true" />
                Wygeneruj Plan Adaptacji Innowacji
              </>
            )}
          </button>
        </form>

        {/* Błąd */}
        {error && (
          <div role="alert" className="bg-red-50 border-l-4 border-red-700 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-700 shrink-0" aria-hidden="true" />
            <p className="text-red-900 font-semibold">{error}</p>
          </div>
        )}

        {result && (
          <article className="bg-white p-8 rounded-xl border border-indigo-300 shadow-md space-y-8 animate-fade-in">
            <header className="border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Raport Middlemana AI
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Plan Wdrożenia dla: {formData.gminaName}
              </h2>
            </header>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">1. Podsumowanie dopasowania</h3>
              <p className="text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed">
                {result.summary}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">2. Zidentyfikowane bariery lokalne</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {result.local_barriers.map((barrier, idx) => (
                  <li key={idx}>{barrier}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">3. Plan Działań Krok po Kroku</h3>
              <ol className="space-y-3">
                {result.action_plan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-700 text-white font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">4. Szacunek budżetowy i rekomendacje</h3>
              <p className="text-slate-800 leading-relaxed">{result.estimated_budget_notes}</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">5. Kluczowe Wskaźniki Sukcesu (KPI)</h3>
              <ul className="space-y-1">
                {result.kpis.map((kpi, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{kpi}</span>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        )}

      </div>
    </main>
  );
}