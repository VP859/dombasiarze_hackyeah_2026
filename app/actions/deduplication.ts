'use server'

import { getSupabaseAdmin } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/ai'
import { MIN_SIMILARITY } from '@/types/matchmaking'

export interface SimilarSolution {
  id: string
  title: string
  problem: string
  method: string
  similarity: number
}

export async function checkIdeaDuplicates(
  title: string,
  essence: string
): Promise<{ isDuplicate: boolean; score: number; similarSolutions: SimilarSolution[] }> {
  const queryText = `Tytuł: ${title}. Opis: ${essence}`
  
  const embedding = await generateEmbedding(queryText)

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.rpc('match_solutions', {
    q: JSON.stringify(embedding),
    k: 3,
  })

  if (error) {
    console.error('Błąd podczas szukania podobnych innowacji:', error)
    return { isDuplicate: false, score: 0, similarSolutions: [] }
  }

  const similarSolutions = ((data || []) as SimilarSolution[]).filter(
    (s) => s.similarity >= MIN_SIMILARITY
  )
  const topScore = similarSolutions.length > 0 ? similarSolutions[0].similarity : 0

  return {
    // Niemal ten sam pomysł daje ~0,76–0,78, niepowiązany z podobnymi słowami ~0,70.
    isDuplicate: topScore > 0.75,
    score: topScore,
    similarSolutions,
  }
}