'use server'

import { getSupabaseAdmin } from '@/lib/supabase'
import { generateGrantApplicationContent, GrantApplicationContent } from '@/lib/ai'

const isValidUuid = (val?: string) =>
  !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)

export async function generateAndSaveGrantApplication(
  ideaId: string,
  callId?: string
): Promise<{ application: GrantApplicationContent; savedId: string }> {
  const supabaseAdmin = getSupabaseAdmin()

  let targetIdeaId = ideaId
  let targetIdeaTitle = 'Testowy Pomysł'
  let targetIdeaEssence = 'Opis testowy'
  let targetIdeaAudience = 'Mieszkańcy Małopolski'
  let targetIdeaCanvas = {}

  if (isValidUuid(ideaId)) {
    const { data: existingIdea } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .maybeSingle()

    if (existingIdea) {
      targetIdeaTitle = existingIdea.title
      targetIdeaEssence = existingIdea.essence
      targetIdeaAudience = existingIdea.audience || targetIdeaAudience
      targetIdeaCanvas = existingIdea.canvas || {}
    }
  } else {
    const { data: newIdea, error: ideaErr } = await supabaseAdmin
      .from('ideas')
      .insert({
        title: 'Pomysł z Generatora Wniosków',
        essence: 'Automatycznie utworzony pomysł dla weryfikacji wniosku.',
        audience: 'Mieszkańcy Małopolski',
        stage: 'pomysł',
        canvas: {},
      })
      .select()
      .single()

    if (ideaErr || !newIdea) {
      throw new Error(`[Błąd tabeli ideas] Nie udało się utworzyć pomysłu: ${ideaErr?.message || ideaErr?.hint}`)
    }
    targetIdeaId = newIdea.id
    targetIdeaTitle = newIdea.title
    targetIdeaEssence = newIdea.essence
  }

  let targetCallId = callId
  let targetCallTitle = 'Małopolskie Innowacje Społeczne 2026'
  let targetCallRules = 'Dofinansowanie do 50 000 PLN na pilotaż rozwiązań społecznych.'

  const { data: existingCall } = isValidUuid(callId)
    ? await supabaseAdmin.from('calls').select('*').eq('id', callId).maybeSingle()
    : { data: null }

  if (existingCall) {
    targetCallTitle = existingCall.title
    targetCallRules = existingCall.rules
  } else {
    // Brak naboru o tym id — bierzemy istniejący, żeby wniosek nie trafił do nieistniejącego naboru.
    const { data: firstCall } = await supabaseAdmin
      .from('calls')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (firstCall) {
      targetCallId = firstCall.id
      targetCallTitle = firstCall.title
      targetCallRules = firstCall.rules
    } else {
      const { data: newCall, error: callErr } = await supabaseAdmin
        .from('calls')
        .insert({
          title: 'Małopolskie Innowacje Społeczne 2026',
          rules: 'Dofinansowanie do 50 000 PLN na pilotaż rozwiązań społecznych.',
        })
        .select()
        .single()

      if (callErr || !newCall) {
        throw new Error(`[Błąd tabeli calls] Brak naborów i błąd tworzenia nowego: ${callErr?.message}`)
      }
      targetCallId = newCall.id
      targetCallTitle = newCall.title
      targetCallRules = newCall.rules
    }
  }

  const applicationContent = await generateGrantApplicationContent(
    {
      title: targetIdeaTitle,
      essence: targetIdeaEssence,
      audience: targetIdeaAudience,
      canvas: targetIdeaCanvas,
    },
    {
      title: targetCallTitle,
      rules: targetCallRules,
    }
  )

  const { data: insertedApp, error: insertError } = await supabaseAdmin
    .from('applications')
    .insert({
      idea_id: targetIdeaId,
      call_id: targetCallId,
      content: applicationContent,
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('Błąd zapisu w PostgreSQL:', insertError)
    throw new Error(`[Błąd bazy Supabase w tabeli applications]: ${insertError.message} (Kod: ${insertError.code})`)
  }

  return {
    application: applicationContent,
    savedId: insertedApp.id,
  }
}