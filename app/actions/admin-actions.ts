'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase' 
import { generateSolutionCard, generateEmbedding, SolutionDraft } from '@/lib/ai' 

export async function generateDraftAction(
  sourceId: string,
  sourceType: 'idea' | 'application'
) {
  const supabaseAdmin = getSupabaseAdmin()

  let title = ''
  let content = ''
  let extraContext = ''

  if (sourceType === 'idea') {
    const { data: idea, error } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('id', sourceId)
      .single()

    if (error || !idea) throw new Error('Nie znaleziono fiszki pomysłu.')
    title = idea.title
    content = idea.description
    extraContext = `Kategoria: ${idea.category || 'Brak'}; Grupa: ${idea.target_group || 'Brak'}`
  } else {
    const { data: app, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', sourceId)
      .single()

    if (error || !app) throw new Error('Nie znaleziono wniosku grantowego.')
    title = app.project_title
    content = `Problem: ${app.problem_statement}\nRozwiązanie: ${app.proposed_solution}`
    extraContext = `Oczekiwany wpływ: ${app.expected_impact}`
  }

  const draft = await generateSolutionCard(sourceType, title, content, extraContext)
  return { success: true, draft }
}

export async function finalizeAndPublishSolutionAction(payload: {
  sourceId: string
  sourceType: 'idea' | 'application'
  solutionData: SolutionDraft
}) {
  const supabaseAdmin = getSupabaseAdmin()
  const { sourceId, sourceType, solutionData } = payload

  const textToEmbed = `${solutionData.title}. ${solutionData.summary}. ${solutionData.full_description}. Grupa: ${solutionData.target_group}. Korzyści: ${solutionData.key_benefits.join(', ')}`
  const embedding = await generateEmbedding(textToEmbed)

  // 2. Zapis nowego rozwiązania
  const { data: newSolution, error: insertError } = await supabaseAdmin
    .from('solutions')
    .insert({
      title: solutionData.title,
      summary: solutionData.summary,
      full_description: solutionData.full_description,
      target_group: solutionData.target_group,
      spatial_scope: solutionData.spatial_scope,
      key_benefits: solutionData.key_benefits,
      implementation_steps: solutionData.implementation_steps,
      status: 'published',
      source_idea_id: sourceType === 'idea' ? sourceId : null,
      source_application_id: sourceType === 'application' ? sourceId : null,
      embedding,
    })
    .select('id')
    .single()

  if (insertError) {
    throw new Error(`Błąd zapisu w bazie danych: ${insertError.message}`)
  }

  // 3. Oznaczenie źródłowej fiszki / wniosku jako 'converted'
  if (sourceType === 'idea') {
    await supabaseAdmin
      .from('ideas')
      .update({ moderation_status: 'converted' })
      .eq('id', sourceId)
  } else {
    await supabaseAdmin
      .from('applications')
      .update({ status: 'converted' })
      .eq('id', sourceId)
  }

  revalidatePath('/admin/moderation')
  revalidatePath('/admin')

  return { success: true, solutionId: newSolution.id }
}

export async function updateSourceStatusAction(
  sourceId: string,
  sourceType: 'idea' | 'application',
  status: 'approved' | 'rejected'
) {
  const supabaseAdmin = getSupabaseAdmin()

  if (sourceType === 'idea') {
    await supabaseAdmin
      .from('ideas')
      .update({ moderation_status: status })
      .eq('id', sourceId)
  } else {
    await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', sourceId)
  }

  revalidatePath('/admin/moderation')
  return { success: true }
}