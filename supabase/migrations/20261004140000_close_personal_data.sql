-- Po włączeniu RLS stare polityki „dostęp dla wszystkich” nadal pozwalały publicznemu kluczowi anon
-- czytać adresy e-mail i treść zgłoszeń. Aplikacja czyta te tabele tylko na serwerze kluczem
-- service role (omija RLS), więc usuwamy wszystkie ich polityki — przeglądarka nie ma tu dostępu.
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('needs', 'messages', 'applications', 'test_signups')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;
