'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'

export type DbMessage = {
  id: string
  subject: string
  role: string
  body: string
  date: string
  answered: boolean
  replyBody?: string
}

export async function getMessagesFromDb(): Promise<DbMessage[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Błąd pobierania wiadomości:', error.message)
    return []
  }

  return (data || []).map((row: unknown) => ({
    id: (row as { id: string }).id,
    subject: (row as { subject_type: string }).subject_type ? `${(row as { subject_type: string }).subject_type}: ${(row as { subject_id: string }).subject_id || ''}` : 'Wiadomość',
    role: (row as { author_role: string }).author_role || 'Mieszkaniec',
    body: (row as { body: string }).body || '',
    date: (row as { created_at: string }).created_at
      ? new Date((row as { created_at: string }).created_at).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })
      : '',
    answered: Boolean((row as { answered: boolean }).answered),
    replyBody: (row as { reply_body: string }).reply_body || undefined,
  }))
}

export async function replyToMessageAction(messageId: string, replyText: string) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('messages')
    .update({
      answered: true,
      reply_body: replyText,
    })
    .eq('id', messageId)

  if (error) {
    console.error('Błąd zapisu odpowiedzi w tabeli messages:', error.message)
    throw new Error(`Nie udało się zapisać odpowiedzi: ${error.message}`)
  }

  revalidatePath('/panel')
}