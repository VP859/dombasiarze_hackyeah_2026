import { getSupabaseAdmin } from '@/lib/supabase'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { AnalyticsChart } from '@/components/admin/AnalyticsChart'

export default async function AdminDashboardPage() {
  const supabaseAdmin = getSupabaseAdmin()

  const [{ count: ideasCount }, { count: appsCount }, { count: solutionsCount }] =
    await Promise.all([
      supabaseAdmin.from('ideas').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('solutions').select('*', { count: 'exact', head: true }),
    ])

  const chartData = [
    { month: 'Maj', ideas: 12, applications: 5, solutions: 3 },
    { month: 'Czerwiec', ideas: 19, applications: 8, solutions: 6 },
    { month: 'Lipiec', ideas: 15, applications: 12, solutions: 9 },
    { month: 'Sierpień', ideas: 22, applications: 14, solutions: 11 },
    { month: 'Wrzesień', ideas: 28, applications: 18, solutions: 15 },
  ]

  return (
    <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Panel Administratora ROPS – Hub Innowacji &quot;Podaj Dalej&quot;
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Zarządzanie cyklem życia innowacji społecznych i automatyzacja z Google Gemini API.
        </p>
      </div>

      <DashboardStats
        ideasCount={ideasCount || 0}
        appsCount={appsCount || 0}
        solutionsCount={solutionsCount || 0}
      />

      <AnalyticsChart data={chartData} />
    </div>
  )
}