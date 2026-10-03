'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/ai'
import { NeedStatus } from '@/app/panel/needs-panel'

export async function publishInnovationAction(id: string) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: solution } = await supabaseAdmin
    .from('solutions')
    .select('title, summary, full_description, target_group')
    .eq('id', id)
    .single()

  let embedding: number[] | null = null
  if (solution) {
    const textToEmbed = `${solution.title}. ${solution.summary}. ${solution.full_description}. Grupa: ${solution.target_group}`
    try {
      embedding = await generateEmbedding(textToEmbed)
    } catch {
    }
  }

  const updatePayload: Record<string, unknown> = { status: 'published' }
  if (embedding) {
    updatePayload.embedding = embedding
  }

  const { error } = await supabaseAdmin
    .from('solutions')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    throw new Error(`Błąd publikacji: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateNeedStatusAction(id: string, newStatus: NeedStatus) {
  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from('needs')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    throw new Error(`Błąd aktualizacji statusu: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function answerMessageAction(id: string) {
  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from('messages')
    .update({ answered: true })
    .eq('id', id)

  if (error) {
    throw new Error(`Błąd aktualizacji wiadomości: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function createCallAction(title: string, deadline: string) {
  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from('calls')
    .insert({
      title,
      deadline,
      applications: 0,
      open: true,
    })

  if (error) {
    throw new Error(`Błąd tworzenia naboru: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}