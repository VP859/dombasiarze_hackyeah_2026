import { Lightbulb, FileText, BookOpen } from 'lucide-react'

interface DashboardStatsProps {
  ideasCount: number
  appsCount: number
  solutionsCount: number
}

export function DashboardStats({ ideasCount, appsCount, solutionsCount }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 rounded-lg">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{ideasCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Zgłoszone Fiszki Pomysłów</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{appsCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Wnioski Grantowe</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{solutionsCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Karty w Bibliotece Innowacji</div>
        </div>
      </div>
    </div>
  )
}