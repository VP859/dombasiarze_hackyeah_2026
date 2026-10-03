import Link from 'next/link'
import { LayoutDashboard, ShieldCheck, BookOpen, LogOut, HeartHandshake } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">Podaj Dalej</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Panel Admina ROPS</p>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Główna nawigacja panelu">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:ring-2 focus:ring-indigo-500"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Dashboard
            </Link>
            <Link
              href="/admin/moderation"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:ring-2 focus:ring-indigo-500"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Moderacja i Konwersja
            </Link>
            <Link
              href="/admin/solutions"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:ring-2 focus:ring-indigo-500"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              Biblioteka Innowacji
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="px-3 py-2 mb-2 text-xs text-slate-500">
            Zalogowano jako: <strong className="block text-slate-700 dark:text-slate-300">Administrator ROPS</strong>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
            Wyjdź z Panelu
          </Link>
        </div>
      </aside>

      {/* Główna zawartość */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}