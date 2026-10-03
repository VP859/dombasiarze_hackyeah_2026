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

  revalidatePath('/panel')
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

  revalidatePath('/panel')
  return { success: true }
}

// Błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export type ReplyState = { ok: true } | { ok: false; error: string }

// Adres e-mail czyta tylko serwer: przeglądarka wysyła id wiadomości i treść odpowiedzi.
export async function replyToMessageAction(id: string, reply: string): Promise<ReplyState> {
  const text = reply.trim()
  if (!text) return { ok: false, error: 'Wpisz treść odpowiedzi.' }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'Wysyłka e-maili nie jest skonfigurowana (brak RESEND_API_KEY).' }

  const supabaseAdmin = getSupabaseAdmin()
  const { data: message, error } = await supabaseAdmin
    .from('messages')
    .select('subject, email')
    .eq('id', id)
    .single()

  if (error || !message) {
    console.error('Błąd pobierania wiadomości:', error)
    return { ok: false, error: 'Nie znaleziono wiadomości.' }
  }
  if (!message.email) return { ok: false, error: 'Autor tej wiadomości nie podał adresu e-mail.' }

  // Resend przez REST — bez dodatkowej paczki. Bez własnej domeny działa tylko nadawca onboarding@resend.dev.
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? 'Podaj Dalej <onboarding@resend.dev>',
      to: [message.email],
      subject: `Re: ${message.subject}`,
      text: `${text}\n\n—\nMałopolski Hub Innowacji Społecznych · ROPS Kraków`,
    }),
  })
  if (!res.ok) {
    console.error('Błąd wysyłki e-maila:', res.status, await res.text())
    return { ok: false, error: 'Nie udało się wysłać e-maila. Spróbuj ponownie za chwilę.' }
  }

  const { error: updateError } = await supabaseAdmin.from('messages').update({ answered: true }).eq('id', id)
  if (updateError) console.error('Błąd oznaczania wiadomości:', updateError)

  revalidatePath('/panel')
  return { ok: true }
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

  revalidatePath('/panel')
  return { success: true }
}