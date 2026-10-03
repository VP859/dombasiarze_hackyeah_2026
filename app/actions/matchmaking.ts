'use server';

import { needSchema } from '@/lib/schemas';
import { generateEmbedding, analyzeNeed } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';
import {
  MatchmakingResult,
  SolutionMatch,
  NeedMatch,
} from '@/types/matchmaking';

export async function processNeedAction(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; data?: MatchmakingResult; error?: string }> {
  try {
    const rawData = {
      description: formData.get('description'),
      gmina: formData.get('gmina'),
      author_email: formData.get('author_email'),
      author_role: formData.get('author_role') || 'resident',
      area_id: formData.get('area_id') || undefined,
    };

    const validated = needSchema.parse(rawData);

    const queryVector = await generateEmbedding(validated.description);

    const { data: needRecord, error: insertError } = await supabaseAdmin
      .from('needs')
      .insert({
        description: validated.description,
        gmina: validated.gmina,
        author_email: validated.author_email,
        author_role: validated.author_role,
        area_id: validated.area_id ?? null,
        embedding: JSON.stringify(queryVector), 
        status: 'open',
      })
      .select('id')
      .single();

    if (insertError || !needRecord) {
      console.error('Supabase Insert Error:', insertError);
      return { success: false, error: 'Błąd podczas zapisywania zgłoszenia w bazie.' };
    }

    const [solutionsRes, needsRes, analysis] = await Promise.all([
      supabaseAdmin.rpc('match_solutions', {
        q: JSON.stringify(queryVector),
        k: 5,
      }),
      supabaseAdmin.rpc('match_needs', {
        q: JSON.stringify(queryVector),
        exclude: needRecord.id,
        k: 3,
      }),
      analyzeNeed(validated.description, validated.gmina),
    ]);

    if (solutionsRes.error) {
      console.error('RPC match_solutions Error:', solutionsRes.error);
    }
    if (needsRes.error) {
      console.error('RPC match_needs Error:', needsRes.error);
    }

    const matchedSolutions: SolutionMatch[] = solutionsRes.data || [];
    const matchedNeeds: NeedMatch[] = needsRes.data || [];

    return {
      success: true,
      data: {
        needId: needRecord.id,
        analysis,
        matchedSolutions,
        matchedNeeds,
      },
    };
  } catch (err: unknown) {
    console.error('Action Error:', err);
    return {
      success: false,
      error: (err as Error).message || 'Wystąpił nieoczekiwany błąd serwera.',
    };
  }
}