# Podaj Dalej — kontekst projektu (HackYeah 2026, zadanie ROPS / HubMI.pl)

Platforma Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków). Łączy problemy społeczne zgłaszane przez mieszkańców, organizacje i gminy z gotowymi innowacjami społecznymi, pomaga je wdrażać w gminach, testować i rozwijać nowe pomysły. Oceniane według karty ROPS: 7 modułów (każdy punktowany osobno), dostępność WCAG 2.1 AA (20%), potencjał wdrożeniowy (20%).

## Stack
Next.js (App Router) + TypeScript, Tailwind, shadcn/ui, lucide-react, Supabase (Postgres + pgvector), LLM + embeddings, e-mail przez Resend, hosting Vercel. Bez nowych zależności poza tymi — najpierw sprawdź, czy coś już jest w repo.

## Moduły i trasy
| Moduł ROPS | Nazwa w aplikacji | Trasy | Właściciel |
| --- | --- | --- | --- |
| I. Matchmaking (obowiązkowy) | Dopasuj | `/zglos`, `/wyniki/[id]` | F1 + backend |
| II. Zasobnik wiedzy | Biblioteka | `/biblioteka`, `/innowacja/[id]`, `/wyzwania` | F4 |
| III. Kreator pomysłów | Kreator | `/kreator`, `/kreator/[id]` | F2 + backend |
| IV. Tester innowacji | Testuj | `/test/[id]`, `/test/[id]/plakat`, ocena na karcie | F2 |
| V. Komunikacja | Rozmowy | komponent wątku | F3 + backend |
| VI. Panel administratora | Panel ROPS | `/panel` | F3 |
| VII. Middleman | Dostosuj do gminy | `/innowacja/[id]/gmina` | F1 + backend |

## Kto co zmienia (nie wchodź w cudze pliki)
- Backend: `app/actions.ts`, `lib/`, `supabase/`, `app/api/`
- F1: `app/zglos`, `app/wyniki`, `app/innowacja/[id]/gmina`
- F2: `app/test`, `app/kreator`, `components/reviews.tsx`
- F3: `app/panel`, `components/thread.tsx`, `components/role-switcher.tsx`
- F4: `app/layout.tsx`, `app/globals.css`, `components/ui/*`, `app/page.tsx`, `app/biblioteka`, `app/innowacja/[id]/page.tsx`, `app/wyzwania`, `seed/`
Do cudzej strony tylko linkuj. Wspólny komponent potrzebny od innej osoby → zostaw komentarz `{/* F2: tu wstawi ... */}`.

## Kontrakt danych
Typy w `lib/types.ts`, akcje w `app/actions.ts` ('use server'). Na start akcje zwracają sztywne dane, więc fronty nie piszą własnych mocków. Zmiana kontraktu tylko po uzgodnieniu z osobą, której dotyczy.

## Role
`resident` (mieszkaniec), `ngo` (organizacja), `jst` (samorząd), `admin` (ROPS), `expert`. W demo bez logowania — przełącznik ról w nagłówku.

## Design
- Kolory: baza Stone, primary Emerald, tryb jasny i ciemny. Jeden mocny akcent na ekran.
- Fonty (next/font/google, subsets `['latin', 'latin-ext']`): Inter `--font-sans`, Figtree `--font-heading` dla h1–h3.
- Tekst bazowy 18 px, przyciski i pola min. 44 px wysokości.
- Cały interfejs po polsku, prosty język, krótkie zdania.

## Dostępność (WCAG 2.1 AA — obowiązkowo w każdym PR)
- `lang="pl"`, unikalny tytuł strony, link „Przejdź do treści”, jedno h1, nagłówki po kolei, landmarki.
- Wszystko z klawiatury, widoczny focus, kontrast tekstu ≥ 4,5:1, obramowań ≥ 3:1.
- Każde pole ma widoczny `<label>`, błędy opisane słowami przy polu.
- Ładowanie i wyniki AI w `aria-live`. Obrazy z alt, ikony dekoracyjne `aria-hidden`.
- Działa przy 200% i 320 px szerokości. Animacje tylko przy `prefers-reduced-motion: no-preference`.

## Dane
Tylko fikcyjne dane, żadnych prawdziwych danych osobowych, e-maile w domenie example.com. E-maile użytkowników czyta wyłącznie serwer.

## Zasady pracy
- Najprostsze rozwiązanie, które działa. Server components, `'use client'` tylko tam, gdzie potrzebny jest stan.
- Minimum każdego modułu do 14. godziny, od 16. godziny tylko poprawki.
- Przed zakończeniem: `npm run build` i `npm run lint` bez błędów.
