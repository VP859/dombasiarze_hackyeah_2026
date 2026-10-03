import { getSupabaseAdmin } from '@/lib/supabase'
import { ModerationTable } from '@/components/admin/ModerationTable'

export default async function ModerationPage() {
  const supabaseAdmin = getSupabaseAdmin()

  const [{ data: ideas }, { data: applications }] = await Promise.all([
    supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('applications')
      .select('*')
      .eq('status', 'submitted')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Centrum Moderacji i Konwersji AI
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Zarządzanie napływającymi fiszkami oraz wnioskami grantowymi i ich automatyczna transformacja w Karty Innowacji.
        </p>
      </div>

      <ModerationTable
        ideas={ideas || []}
        applications={applications || []}
      />
    </div>
  )
}