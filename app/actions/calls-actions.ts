'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'

export type CallDb = {
  id: string
  title: string
  deadline: string
  applicationsCount: number
  open: boolean
}

export type ApplicationDb = {
  id: string
  ideaTitle: string
  authorEmail: string
  createdAt: string
  content: unknown
}

export async function getCallsFromDb(): Promise<CallDb[]> {
  const supabase = getSupabaseAdmin()

  const { data: callsData, error: callsError } = await supabase
    .from('calls')
    .select('id, title, deadline, open, created_at')
    .order('created_at', { ascending: false })

  if (callsError) {
    console.error('Błąd pobierania naborów:', callsError.message)
    return []
  }

  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('call_id')

  if (appsError) {
    console.error('Błąd pobierania wniosków:', appsError.message)
  }

  const countMap: Record<string, number> = {}
  if (appsData) {
    for (const app of appsData) {
      if (app.call_id) {
        countMap[app.call_id] = (countMap[app.call_id] || 0) + 1
      }
    }
  }

  return (callsData || []).map((row: unknown) => ({
    id: (row as { id: string }).id,
    title: (row as { title: string }).title || 'Nabór bez tytułu',
    deadline: (row as { deadline: string }).deadline ? (row as { deadline: string }).deadline.split('T')[0] : new Date().toISOString().split('T')[0],
    open: Boolean((row as { open: boolean }).open),
    applicationsCount: countMap[(row as { id: string }).id] || 0,
  }))
}

export async function createCallAction(input: { title: string; deadline: string }) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('calls')
    .insert({
      title: input.title,
      deadline: input.deadline,
      open: true,
    })

  if (error) {
    console.error('Błąd tworzenia naboru:', error.message)
    throw new Error(`Nie udało się utworzyć naboru: ${error.message}`)
  }

  revalidatePath('/panel')
}

export async function toggleCallStatusAction(callId: string, currentOpen: boolean) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('calls')
    .update({ open: !currentOpen })
    .eq('id', callId)

  if (error) {
    console.error('Błąd zmiany statusu naboru:', error.message)
    throw new Error(`Nie udało się zmienić statusu: ${error.message}`)
  }

  revalidatePath('/panel')
}

export async function getApplicationsForCall(callId: string): Promise<ApplicationDb[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      created_at,
      content,
      ideas (
        title,
        author_email
      )
    `)
    .eq('call_id', callId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Błąd pobierania wniosków:', error.message)
    return []
  }

  return (data || []).map((row: unknown) => ({
    id: (row as { id: string }).id,
    ideaTitle: (row as { ideas: { title: string } }).ideas?.title || 'Wniosek',
    authorEmail: (row as { ideas: { author_email: string } }).ideas?.author_email || 'Nie podano',
    createdAt: (row as { created_at: string }).created_at ? new Date((row as { created_at: string }).created_at).toLocaleDateString('pl-PL') : '',
    content: (row as { content: unknown }).content || {},
  }))
}