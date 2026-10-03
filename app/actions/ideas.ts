'use server'

import { getSupabaseAdmin } from '@/lib/supabase'

export interface SaveIdeaInput {
  title: string
  essence: string
  audience: string
  stage: 'pomysł' | 'pilotaż' | 'sprawdzona'
  canvas: unknown
  authorEmail: string
}

export async function saveIdeaAction(input: SaveIdeaInput) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('ideas')
    .insert({
      title: input.title,
      essence: input.essence,
      audience: input.audience,
      stage: input.stage,
      canvas: input.canvas,
      author_email: input.authorEmail,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Błąd zapisu pomysłu:', error)
    throw new Error(error.message)
  }

  return data
}