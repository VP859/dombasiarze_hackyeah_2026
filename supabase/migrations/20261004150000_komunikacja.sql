-- Komunikacja: adres autora (tam idzie odpowiedź), adresat pytania (ROPS albo mentor)
-- i link do sprawy, której dotyczy (innowacja albo pomysł).
alter table messages add column if not exists email text;
alter table messages add column if not exists recipient text not null default 'rops'
  check (recipient in ('rops', 'mentor'));
alter table messages add column if not exists link text;

notify pgrst, 'reload schema';
