'use server';

import { z } from 'zod';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface Solution {
  id: string;
  title: string;
  problem: string;
  method: string;
  effect: string | null;
  resources: string | null;
  audience: string | null;
  stage: 'pomysł' | 'pilotaż' | 'sprawdzona';
  challenge_ids: number[];
  video_url: string | null;
  source_url: string | null;
  status: 'draft' | 'verified' | 'published';
}

export interface Review {
  id: string;
  solution_id: string;
  rating: number;
  comment: string | null;
  improvement: string | null;
  created_at: string;
}

export interface Challenge {
  id: number;
  name: string;
  summary: string | null;
  source_url: string | null;
}

export async function getSolutions(filters?: { stage?: string; search?: string }) {
  let query = supabase
    .from('solutions')
    .select('*')
    .eq('status', 'published')
    .order('title', { ascending: true });

  if (filters?.stage && filters.stage !== 'all') {
    query = query.eq('stage', filters.stage);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,problem.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Błąd pobierania rozwiązań: ${error.message}`);
  return data as Solution[];
}

export async function getSolutionById(id: string) {
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Solution;
}

export async function getReviewsForSolution(solutionId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('solution_id', solutionId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Błąd pobierania ocen: ${error.message}`);
  return data as Review[];
}

export async function addReview(formData: FormData) {
  const solution_id = formData.get('solution_id') as string;
  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment') as string;
  const improvement = formData.get('improvement') as string;

  if (!solution_id || !rating || rating < 1 || rating > 5) {
    throw new Error('Nieprawidłowe dane formularza.');
  }

  const { error } = await supabase.from('reviews').insert([
    {
      solution_id,
      rating,
      comment: comment || null,
      improvement: improvement || null,
    },
  ]);

  if (error) throw new Error(`Błąd dodawania oceny: ${error.message}`);

  revalidatePath(`/innowacja/${solution_id}`);
}

// Tester innowacji: zapisy czyta i zapisuje tylko serwer (adresy e-mail nie trafiają do przeglądarki).
const signupSchema = z.object({
  solution_id: z.uuid(),
  name: z.string().trim().min(1, 'Wpisz imię.').max(100),
  email: z.email('Podaj poprawny adres e-mail.'),
  consent: z.literal('on', 'Zaznacz zgodę na kontakt w sprawie testu.'),
});

// Błędy zwracamy jako wartość, bo Next maskuje rzucone błędy w produkcji.
export type SignupState = { ok: true } | { ok: false; error: string } | null;

export async function signUpForTest(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    solution_id: formData.get('solution_id'),
    name: formData.get('name'),
    email: formData.get('email'),
    consent: formData.get('consent'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { solution_id, name, email } = parsed.data;
  const { error } = await getSupabaseAdmin().from('test_signups').insert({ solution_id, name, email });
  // 23505: unikalny indeks (innowacja, e-mail) — ten adres już jest zapisany.
  if (error?.code === '23505') return { ok: false, error: 'Ten adres jest już zapisany na test tej innowacji.' };
  if (error) {
    console.error('Zapis na test:', error);
    return { ok: false, error: 'Nie udało się zapisać. Spróbuj ponownie za chwilę.' };
  }

  revalidatePath(`/test/${solution_id}`);
  return { ok: true };
}

export async function getTestSignupCount(solutionId: string) {
  const { count, error } = await getSupabaseAdmin()
    .from('test_signups')
    .select('*', { count: 'exact', head: true })
    .eq('solution_id', solutionId);
  if (error) console.error('Liczba zapisów na test:', error.message);
  return count ?? 0;
}
