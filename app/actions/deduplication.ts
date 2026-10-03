'use server'

import { getSupabaseAdmin } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/ai'

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
    query_embedding: JSON.stringify(embedding),
    match_threshold: 0.35,
    match_count: 3,
  })

  if (error) {
    console.error('Błąd podczas szukania podobnych innowacji:', error)
    return { isDuplicate: false, score: 0, similarSolutions: [] }
  }

  const similarSolutions: SimilarSolution[] = data || []
  const topScore = similarSolutions.length > 0 ? similarSolutions[0].similarity : 0

  return {
    isDuplicate: topScore > 0.75,
    score: topScore,
    similarSolutions,
  }
}