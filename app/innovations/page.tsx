import Link from 'next/link';
import { getSolutions } from '../actions/solutions';
import { Search, Filter, Lightbulb, CheckCircle2, TestTube2, ArrowRight } from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ stage?: string; search?: string }>;
}

export default async function InnovationsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const stage = resolvedParams.stage || 'all';
  const search = resolvedParams.search || '';

  const solutions = await getSolutions({ stage, search });

  const getStageBadge = (s: string) => {
    switch (s) {
      case 'sprawdzona':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Sprawdzona
          </span>
        );
      case 'pilotaż':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <TestTube2 className="w-3.5 h-3.5" aria-hidden="true" /> Pilotaż
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" /> Pomysł
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 focus:outline-none" id="main-content">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Nagłówek */}
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Biblioteka Innowacji Społecznych
          </h1>
          <p className="mt-2 text-lg text-slate-700">
            Zasobnik sprawdzonych rozwiązań gotowych do przeszczepienia w Twojej gminie.
          </p>
        </header>

        {/* Wyszukiwarka i Filtry */}
        <section aria-label="Filtrowanie innowacji" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <label htmlFor="search-input" className="block text-sm font-semibold text-slate-900 mb-1">
                Szukaj innowacji
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Wpisz nazwę problemu lub tytuł..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-400 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3 top-3" aria-hidden="true" />
              </div>
            </div>

            <div>
              <label htmlFor="stage-select" className="block text-sm font-semibold text-slate-900 mb-1">
                Etap dojrzałości
              </label>
              <div className="relative">
                <select
                  id="stage-select"
                  name="stage"
                  defaultValue={stage}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none appearance-none"
                >
                  <option value="all">Wszystkie etapy</option>
                  <option value="pomysł">Pomysł</option>
                  <option value="pilotaż">Pilotaż</option>
                  <option value="sprawdzona">Sprawdzona innowacja</option>
                </select>
                <Filter className="w-5 h-5 text-slate-500 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-blue-800 hover:bg-blue-900 text-white font-medium px-6 py-2.5 rounded-lg transition focus:ring-4 focus:ring-blue-400 outline-none"
              >
                Filtruj wyniki
              </button>
            </div>
          </form>
        </section>

        {/* Lista Innowacji */}
        <section aria-label="Lista dostępnych innowacji">
          {solutions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-xl text-slate-700 font-medium">Brak innowacji spełniających kryteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between p-6 focus-within:ring-2 focus-within:ring-blue-700"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      {getStageBadge(item.stage)}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 line-clamp-2">
                      <Link
                        href={`/innovations/${item.id}`}
                        className="hover:underline focus:outline-none focus:text-blue-900"
                      >
                        {item.title}
                      </Link>
                    </h2>
                    <p className="text-slate-700 text-sm line-clamp-3">
                      <span className="font-semibold text-slate-900">Problem:</span> {item.problem}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">
                      Odbiorcy: {item.audience || 'Ogólna'}
                    </span>
                    <Link
                      href={`/innovations/${item.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-blue-800 hover:text-blue-900 focus:ring-2 focus:ring-blue-700 rounded px-2 py-1 outline-none"
                      aria-label={`Zobacz szczegóły innowacji: ${item.title}`}
                    >
                      Szczegóły <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}