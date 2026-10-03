import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('Brak zmiennej środowiskowej NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Brak zmiennej środowiskowej NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Klient bezpieczny dla przeglądarki (klient)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Klient administratora przeznaczony WYŁĄCZNIE dla serwera (Server Actions / API Routes)
export function getSupabaseAdmin() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceRoleKey) {
    throw new Error('Brak zmiennej środowiskowej SUPABASE_SERVICE_ROLE_KEY po stronie serwera');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}