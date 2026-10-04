'use server'

import { after } from 'next/server'
import { z } from 'zod'

import { generateIdeaTips, type CanvasData, type IdeaTips } from '@/lib/ai'
import { notifyRops, siteUrl } from '@/lib/email'
import { getSupabaseAdmin } from '@/lib/supabase'

const ideaSchema = z.object({
  title: z.string().trim().min(1, 'Wpisz tytuł pomysłu.').max(200),
  essence: z.string().trim().min(1, 'Opisz pomysł.').max(5000),
  audience: z.string().trim().max(300),
  stage: z.enum(['pomysł', 'pilotaż', 'sprawdzona']),
  canvas: z.record(z.string(), z.string().max(5000)),
  authorEmail: z.union([z.literal(''), z.email('Podaj poprawny adres e-mail.')]),
})

export type SaveIdeaInput = {
  title: string
  essence: string
  audience: string
  stage: 'pomysł' | 'pilotaż' | 'sprawdzona'
  canvas: CanvasData
  authorEmail: string
}

export async function saveIdeaAction(input: SaveIdeaInput) {
  const parsed = ideaSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const idea = parsed.data
  const canvas = idea.canvas as Partial<CanvasData>

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('ideas')
    .insert({
      title: idea.title,
      essence: idea.essence,
      audience: idea.audience,
      stage: idea.stage,
      canvas: idea.canvas,
      author_email: idea.authorEmail || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Błąd zapisu w Supabase:', error)
    throw new Error(error.message)
  }

  // Szkic w bibliotece: ROPS widzi go w Panelu („Do weryfikacji”), po zatwierdzeniu trafia do biblioteki i dopasowań.
  const { error: draftError } = await supabaseAdmin.from('solutions').insert({
    title: idea.title,
    problem: canvas.problem_definition || null,
    method: idea.essence,
    effect: canvas.expected_outcomes || null,
    audience: idea.audience || null,
    stage: idea.stage,
    status: 'draft',
  })
  // Pomysł już jest zapisany — błąd szkicu tylko logujemy, żeby autor nie stracił pracy.
  if (draftError) console.error('Błąd tworzenia szkicu innowacji:', draftError)

  after(() =>
    notifyRops(
      `Nowy pomysł do weryfikacji: ${idea.title}`,
      `${idea.essence}\n\nFiszka pomysłu: ${siteUrl(`/kreator/${data.id}`)}`
    )
  )
  return data
}

export async function getIdea(id: string) {
  if (!z.uuid().safeParse(id).success) return null
  const { data } = await getSupabaseAdmin()
    .from('ideas')
    .select('id, title, essence, audience, stage, canvas')
    .eq('id', id)
    .maybeSingle()
  return data as {
    id: string
    title: string
    essence: string | null
    audience: string | null
    stage: string | null
    canvas: Partial<CanvasData> | null
  } | null
}

// Błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export async function developIdeaAction(
  ideaId: string
): Promise<{ ok: true; tips: IdeaTips } | { ok: false; error: string }> {
  const idea = await getIdea(ideaId)
  if (!idea) return { ok: false, error: 'Nie znaleźliśmy tego pomysłu.' }

  try {
    return { ok: true, tips: await generateIdeaTips(idea) }
  } catch (err) {
    console.error('Asystent kreatora:', err)
    return { ok: false, error: 'Asystent nie odpowiedział. Spróbuj ponownie za chwilę.' }
  }
}
