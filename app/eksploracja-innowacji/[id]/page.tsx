import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSolutionById, getReviewsForSolution, addReview } from '@/app/actions/solutions';
import { Star, Wand2, ArrowLeft, Video, ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const solution = await getSolutionById(id);

  if (!solution) {
    notFound();
  }

  const reviews = await getReviewsForSolution(id);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Nav */}
        <Link
          href="/eksploracja-innowacji"
          className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-semibold focus:ring-2 focus:ring-blue-700 rounded px-2 py-1 outline-none"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Powrót do Zasobnika
        </Link>

        {/* Main innovation card */}
        <article className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <header className="border-b border-slate-200 pb-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <span className="uppercase tracking-wide text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                Etap: {solution.stage}
              </span>
              {avgRating && (
                <div className="flex items-center gap-1 text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
                  <span>{avgRating} / 5 ({reviews.length} ocen)</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900">{solution.title}</h1>
          </header>

          <section className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-700" aria-hidden="true" />
                Pośrednik Innowacji: Dostosuj do swojej gminy
              </h2>
              <p className="text-sm text-indigo-900 mt-1">
                Użyj naszej sztucznej inteligencji, aby wygenerować plan adaptacji tej innowacji pod specyfikę i budżet Twojego samorządu.
              </p>
            </div>
            <Link
              href={`/eksploracja-innowacji/${solution.id}/adapt`}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-5 py-2.5 rounded-lg shadow transition focus:ring-4 focus:ring-indigo-300 outline-none whitespace-nowrap"
            >
              Dostosuj dla Gminy
            </Link>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <section className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Rozwiązywany problem</h2>
              <p className="text-slate-800 leading-relaxed">{solution.problem}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Metoda i sposób działania</h2>
              <p className="text-slate-800 leading-relaxed">{solution.method}</p>
            </section>

            {solution.effect && (
              <section className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Oczekiwane efekty</h2>
                <p className="text-slate-800 leading-relaxed">{solution.effect}</p>
              </section>
            )}

            {solution.resources && (
              <section className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Wymagane zasoby</h2>
                <p className="text-slate-800 leading-relaxed">{solution.resources}</p>
              </section>
            )}
          </div>

          {(solution.video_url || solution.source_url) && (
            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Materiały źródłowe</h2>
              <div className="flex flex-wrap gap-4">
                {solution.video_url && (
                  <a
                    href={solution.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-800 hover:underline font-semibold focus:ring-2 focus:ring-blue-700 rounded px-2 py-1 outline-none"
                  >
                    <Video className="w-4 h-4" aria-hidden="true" /> Obejrzyj wideo wdrożeniowe
                  </a>
                )}
                {solution.source_url && (
                  <a
                    href={solution.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-800 hover:underline font-semibold focus:ring-2 focus:ring-blue-700 rounded px-2 py-1 outline-none"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" /> Strona źródłowa innowacji
                  </a>
                )}
              </div>
            </section>
          )}
        </article>

        <section aria-labelledby="reviews-heading" className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
          <h2 id="reviews-heading" className="text-2xl font-bold text-slate-900">
            Oceny i Doświadczenia Wdrożeniowe ({reviews.length})
          </h2>

          <form action={addReview} className="bg-slate-50 p-6 rounded-lg border border-slate-300 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Dodaj własną ocenę / uwagi z wdrożenia</h3>
            <input type="hidden" name="solution_id" value={solution.id} />

            <div>
              <label htmlFor="rating" className="block text-sm font-semibold text-slate-900 mb-1">
                Ocena (1-5 gwiazdek) *
              </label>
              <select
                id="rating"
                name="rating"
                required
                className="w-full sm:w-48 p-2.5 rounded-md border border-slate-400 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-700 outline-none"
              >
                <option value="5">5 - Bardzo dobra</option>
                <option value="4">4 - Dobra</option>
                <option value="3">3 - Średnia</option>
                <option value="2">2 - Słaba</option>
                <option value="1">1 - Bardzo słaba</option>
              </select>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-semibold text-slate-900 mb-1">
                Komentarz / Opinia
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                className="w-full p-2.5 rounded-md border border-slate-400 text-slate-900 focus:ring-2 focus:ring-blue-700 outline-none"
                placeholder="Jak innowacja sprawdziła się w praktyce?"
              />
            </div>

            <div>
              <label htmlFor="improvement" className="block text-sm font-semibold text-slate-900 mb-1">
                Sugerowane ulepszenia dla innych gmin
              </label>
              <textarea
                id="improvement"
                name="improvement"
                rows={2}
                className="w-full p-2.5 rounded-md border border-slate-400 text-slate-900 focus:ring-2 focus:ring-blue-700 outline-none"
                placeholder="Co warto zmodyfikować przed wdrożeniem?"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition focus:ring-4 focus:ring-blue-400 outline-none"
            >
              Wyślij opinię
            </button>
          </form>

          {/* Reviews section */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-slate-600">Ta innowacja nie posiada jeszcze ocen. Bądź pierwszym samorządem, który ją oceni!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="border-b border-slate-200 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
                      Ocena: {rev.rating}/5
                    </span>
                    <time className="text-xs text-slate-500">
                      {new Date(rev.created_at).toLocaleDateString('pl-PL')}
                    </time>
                  </div>
                  {rev.comment && <p className="text-slate-800">{rev.comment}</p>}
                  {rev.improvement && (
                    <p className="text-sm text-slate-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                      <strong>Rekomendowane usprawnienie:</strong> {rev.improvement}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}