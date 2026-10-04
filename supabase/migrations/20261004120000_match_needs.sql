-- Podobne zgłoszenia: wektor opisu potrzeby i wyszukiwanie najbliższych (podobieństwo cosinusowe).
-- Stara wersja match_needs czytała nieistniejące kolumny (description, embedding) i zawsze zwracała błąd.
-- Po uruchomieniu: node --env-file=.env scripts/embed.mjs (policzy wektory starych zgłoszeń).
-- ponytail: bez indeksu — przy ~10 tys. zgłoszeń dodać: create index on needs using hnsw (embedding vector_cosine_ops);

alter table needs add column if not exists embedding vector(768);

drop function if exists match_needs;

create function match_needs(q vector(768), k int default 3)
returns table (id uuid, description text, gmina text, similarity float)
language sql stable
set search_path = public, extensions
as $$
  select n.id, n.text::text, n.gmina::text, (1 - (n.embedding <=> q))::float
  from needs n
  where n.embedding is not null
  order by n.embedding <=> q
  limit k
$$;

notify pgrst, 'reload schema';
