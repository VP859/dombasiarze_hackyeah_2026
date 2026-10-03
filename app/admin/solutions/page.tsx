import { getSupabaseAdmin } from '@/lib/supabase'
import { Solution, SolutionStatus } from '@/types/admin'
import { BookOpen, Tag, MapPin, CheckCircle, Archive } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function updateSolutionStatus(id: string, status: SolutionStatus) {
  'use server'
  const supabaseAdmin = getSupabaseAdmin()
  await supabaseAdmin.from('solutions').update({ status }).eq('id', id)
  revalidatePath('/admin/solutions')
}

export default async function SolutionsManagementPage() {
  const supabaseAdmin = getSupabaseAdmin()
  const { data: solutions } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .order('created_at', { ascending: false })

  const items: Solution[] = solutions || []

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Zarządzanie Biblioteką Innowacji Społecznych
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Przegląd, zmiana statusów widoczności oraz publikacja oficjalnych Kart Rozwiązań ROPS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((solution) => (
          <div
            key={solution.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    solution.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : solution.status === 'verified'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      : solution.status === 'archived'
                      ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {solution.status}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(solution.created_at).toLocaleDateString('pl-PL')}
                </span>
              </div>

              <h2 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
                {solution.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                {solution.summary}
              </p>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Grupa: {solution.target_group}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Zasięg: {solution.spatial_scope}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <form
                action={async () => {
                  'use server'
                  await updateSolutionStatus(
                    solution.id,
                    solution.status === 'published' ? 'archived' : 'published'
                  )
                }}
                className="w-full"
              >
                <button
                  type="submit"
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    solution.status === 'published'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {solution.status === 'published' ? (
                    <>
                      <Archive className="w-3.5 h-3.5" /> Archiwizuj
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Opublikuj
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          Brak kart rozwiązań w bazie. Skonwertuj zgłoszenie w zakładce Moderacja.
        </div>
      )}
    </div>
  )
}