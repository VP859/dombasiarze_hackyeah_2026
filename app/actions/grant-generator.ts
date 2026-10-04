'use server'

import { getSupabaseAdmin } from '@/lib/supabase'
import { generateGrantApplicationContent, type GrantApplicationContent } from '@/lib/ai'
import { getOpenCalls } from '@/app/actions/calls-actions'
import { getIdea } from '@/app/actions/ideas'

// Błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export type GrantResult =
  | { ok: true; application: GrantApplicationContent }
  | { ok: false; error: string }

export async function generateAndSaveGrantApplication(ideaId: string, callId: string): Promise<GrantResult> {
  const [idea, openCalls] = await Promise.all([getIdea(ideaId), getOpenCalls()])
  if (!idea) return { ok: false, error: 'Nie znaleźliśmy tego pomysłu.' }

  // Wniosek przyjmujemy tylko do trwającego naboru — po terminie generator się zamyka.
  const call = openCalls.find((c) => c.id === callId)
  if (!call) return { ok: false, error: 'Ten nabór jest już zamknięty. Wybierz inny.' }

  try {
    const application = await generateGrantApplicationContent(
      {
        title: idea.title,
        essence: idea.essence ?? '',
        audience: idea.audience || 'Mieszkańcy Małopolski',
        canvas: idea.canvas ?? {},
      },
      {
        title: call.title,
        rules: call.rules || `Nabór „${call.title}”, termin składania wniosków ${call.deadline}.`,
      }
    )

    const { error } = await getSupabaseAdmin()
      .from('applications')
      .insert({ idea_id: idea.id, call_id: call.id, content: application })
    if (error) {
      console.error('Zapis wniosku:', error)
      return { ok: false, error: 'Nie udało się zapisać wniosku. Spróbuj ponownie za chwilę.' }
    }

    return { ok: true, application }
  } catch (err) {
    console.error('Generator wniosków:', err)
    return { ok: false, error: 'Asystent nie odpowiedział. Spróbuj ponownie za chwilę.' }
  }
}
