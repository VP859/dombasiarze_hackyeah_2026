-- Kreator pomysłów: zasady naboru — pod nie asystent dopasowuje każdy wniosek o grant.
alter table calls add column if not exists rules text;

-- Tester innowacji: jeden adres zapisuje się na test danej innowacji tylko raz.
create unique index if not exists test_signups_solution_email_key on test_signups (solution_id, lower(email));

-- Adresy e-mail mieszkańców były do odczytu przez publiczny klucz anon (jest w przeglądarce).
-- Aplikacja czyta te tabele tylko na serwerze kluczem service role, który omija RLS,
-- więc RLS bez żadnych polityk zamyka je dla przeglądarki i niczego nie psuje.
alter table needs enable row level security;
alter table messages enable row level security;
alter table applications enable row level security;
alter table test_signups enable row level security;

notify pgrst, 'reload schema';
