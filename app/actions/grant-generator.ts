'use server'

import { getSupabaseAdmin } from '@/lib/supabase'
import { generateGrantApplicationContent, GrantApplicationContent } from '@/lib/ai'

const FALLBACK_CALL = {
  id: 1,
  title: 'Małopolskie Innowacje Społeczne 2026 — Edycja Jesień',
  rules: 'Dofinansowanie do 50 000 PLN na pilotaż rozwiązań wspierających seniorów, przeciwdziałających wykluczeniu cyfrowemu oraz aktywizujących społeczności lokalne w gminach Małopolski.',
}

export async function generateGrantApplication(
  ideaId: string,
  callId: number
): Promise<GrantApplicationContent> {
  const supabaseAdmin = getSupabaseAdmin()

  const [{ data: idea, error: ideaError }, { data: call, error: callError }] = await Promise.all([
    supabaseAdmin.from('ideas').select('*').eq('id', ideaId).maybeSingle(),
    supabaseAdmin.from('calls').select('*').eq('id', callId).maybeSingle(),
  ])

  const targetIdea = idea || {
    id: ideaId,
    title: 'Testowy Pomysł Innowacji',
    essence: 'Rozwiązanie testowe służące weryfikacji działania generatora wniosków.',
    audience: 'Mieszkańcy gmin wiejskich',
    canvas: {
      problem_definition: 'Brak dostępu do nowoczesnych usług społecznych.',
      target_group_needs: 'Potrzeba wsparcia cyfrowego i integracji.',
      innovative_aspect: 'Nowe podejście do asystencji lokalnej.',
      expected_outcomes: 'Wzrost aktywizacji społecznej o 30%.',
      potential_risks: 'Niska frekwencja w pierwszym etapie.',
    },
  }

  const targetCall = call || FALLBACK_CALL

  const applicationContent = await generateGrantApplicationContent(
    {
      title: targetIdea.title,
      essence: targetIdea.essence,
      audience: targetIdea.audience || 'Mieszkańcy Małopolski',
      canvas: targetIdea.canvas,
    },
    {
      title: targetCall.title,
      rules: targetCall.rules,
    }
  )

  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ideaId)

  if (isValidUuid && idea) {
    const { error: insertError } = await supabaseAdmin.from('applications').insert({
      idea_id: ideaId,
      call_id: targetCall.id,
      content: applicationContent,
    })

    if (insertError) {
      console.warn('Wniosek został wygenerowany, ale wystąpił ostrzeżenie przy zapisie w bazie:', insertError.message)
    }
  }

  return applicationContent
}