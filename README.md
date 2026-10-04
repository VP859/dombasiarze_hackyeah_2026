# Podaj Dalej — nie wymyślaj koła na nowo 

Platforma Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków), przygotowana na HackYeah 2026.

Łączy problemy społeczne zgłaszane przez mieszkańców, organizacje i gminy z gotowymi innowacjami społecznymi. Pomaga dostosować sprawdzone rozwiązanie do konkretnej gminy, przetestować je z mieszkańcami i rozwijać nowe pomysły.

## Problem

Gminy często tworzą od zera rozwiązania, które gdzie indziej już działają. Wiedza o sprawdzonych innowacjach jest rozproszona, a dostosowanie ich do lokalnych warunków wymaga czasu i ekspertów.

## Co potrafi aplikacja

| Moduł ROPS | W aplikacji | Trasa | Stan |
| --- | --- | --- | --- |
| I. Matchmaking | Zgłoś problem | `/zglos` | Formularz z mapą gotowy; zapis do bazy, analiza AI i dopasowania w trakcie podpinania |
| II. Zasobnik wiedzy | Biblioteka, wyzwania, strona innowacji | `/biblioteka`, `/innowacja/[id]`, `/wyzwania` | Działa (Supabase) |
| III. Kreator pomysłów | Zgłoś rozwiązanie, wniosek o grant | `/kreator`, `/granty/generator` | Działa (Gemini + Supabase); rozwijanie pomysłu `/kreator/[id]` poglądowe |
| IV. Tester innowacji | Zapisy do testu, plakat z QR, opinie | `/test/[id]`, `/test/[id]/plakat` | Plakat i opinie działają, zapisy jeszcze bez bazy |
| V. Komunikacja | Wątek z ROPS, odpowiedzi z panelu | `/kreator/[id]`, `/panel` | Widok poglądowy; wysyłka odpowiedzi e-mailem (Resend) gotowa po stronie serwera |
| VI. Panel administratora | Panel ROPS | `/panel` | Innowacje do weryfikacji i zgłoszenia z bazy (publikacja, zmiana statusu); wiadomości i nabory poglądowe |
| VII. Middleman | Dostosuj do gminy | `/innowacja/[id]/gmina` | Działa (Gemini) |

### Najważniejsze funkcje

- **Role bez logowania:** przełącznik „Jestem…” w nagłówku (mieszkaniec, organizacja, samorząd, ROPS, ekspert) zmienia główne działania na stronie głównej i przy innowacjach, a „Panel ROPS” pokazuje w menu tylko roli ROPS. Rolę trzyma ciasteczko; to tryb demo, nie uprawnienia.
- **Biblioteka innowacji:** wyszukiwarka i filtry (wyzwanie, odbiorcy, etap), wyniki z bazy Supabase, karty z ocenami. Filtr wyzwań dopasowuje innowacje po słowach kluczowych z `seed/challenges.json`, dopóki innowacje w bazie nie mają przypisanych wyzwań.
- **Strona innowacji:** problem, rozwiązanie, efekty, potrzebne zasoby, materiały źródłowe, oceny i formularz dodawania opinii (działa też bez JavaScriptu).
- **Dostosuj do gminy:** gmina podaje nazwę, liczbę mieszkańców, typ, budżet i lokalne wyzwania, a asystent AI przygotowuje plan wdrożenia: kroki, możliwe bariery, budżet i źródła finansowania, wskaźniki sukcesu.
- **Zgłaszanie problemu:** opis potrzeby także głosem (rozpoznawanie mowy w przeglądarce, Web Speech API), miejsce na mapie (OpenStreetMap), wybór wyzwań i odbiorców. Zapis do bazy z analizą AI i dopasowaniem innowacji (embeddingi + pgvector) jest w trakcie podpinania.
- **Kreator pomysłów:** asystent AI układa opis pomysłu w kanwę innowacji ROPS i sprawdza, czy podobne rozwiązanie już jest w bibliotece; pomysł zapisuje się w bazie. Z zapisanego pomysłu generator przygotowuje szkic wniosku o grant pod wybrany nabór.
- **Tester:** plakat do wydruku z kodem QR prowadzącym do zapisów na test.
- **Panel ROPS:** weryfikacja i publikacja nowych innowacji z podglądem, zgłoszenia potrzeb z filtrami i zmianą statusu, wiadomości i nabory.

## Dostępność (WCAG 2.1 AA)

- Język strony `pl`, unikalne tytuły, link „Przejdź do treści”, jeden nagłówek `h1` i nagłówki po kolei, landmarki.
- Pełna obsługa klawiaturą i wyraźny fokus (obrys 2 px w kolorze marki).
- Kontrast tekstu co najmniej 4,5:1, obramowań pól i fokusu co najmniej 3:1 — w trybie jasnym i ciemnym.
- Tekst bazowy 18 px, przycisk **A+** do powiększania tekstu (zapamiętywany), przyciski i pola min. 44 px.
- Tryb jasny i ciemny.
- Każde pole ma widoczną etykietę, a błędy są opisane słowami.
- Wyniki i stany ładowania ogłaszane przez `aria-live`.
- Działa przy szerokości 320 px i powiększeniu 200%. Przyklejony nagłówek przy dużym powiększeniu się odkleja.
- Animacje tylko przy `prefers-reduced-motion: no-preference`.
- [Deklaracja dostępności](app/deklaracja-dostepnosci/page.tsx) i prosty język.
- Sprawdzone narzędziem axe-core (reguły WCAG 2.1 A i AA) na wszystkich stronach w obu motywach oraz ręcznie: klawiatura, 320 px, odstępy w tekście.

## Technologia

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions), TypeScript
- Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) (Base UI), lucide-react
- [Supabase](https://supabase.com): Postgres + pgvector
- Google Gemini (`gemini-3.1-flash-lite`, `gemini-embedding-001`): analiza zgłoszeń, kanwa pomysłu, plany wdrożenia, szkice wniosków, embeddingi
- Leaflet + OpenStreetMap Nominatim: mapa i wyszukiwanie adresów w zgłoszeniu problemu
- Resend: e-maile z odpowiedziami z Panelu ROPS

## Uruchomienie lokalnie

Wymagany Node.js 20 lub nowszy.

```bash
npm install
```

Utwórz plik `.env` w katalogu głównym:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
# opcjonalnie: adres, na który prowadzi kod QR na plakacie
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# opcjonalnie: wysyłka odpowiedzi z Panelu ROPS e-mailem
RESEND_API_KEY=...
RESEND_FROM="Podaj Dalej <onboarding@resend.dev>"
```

Uruchom serwer deweloperski i otwórz http://localhost:3000:

```bash
npm run dev
```

Inne polecenia:

```bash
npm run build   # wersja produkcyjna
npm run lint    # ESLint
```

## Struktura projektu

```
app/
  page.tsx                  strona główna z mapą Małopolski
  biblioteka/               biblioteka innowacji
  innowacja/[id]/           strona innowacji z opiniami
  innowacja/[id]/gmina/     Dostosuj do gminy (AI)
  wyzwania/                 wyzwania społeczne z linkami do biblioteki
  zglos/                    zgłaszanie problemu z mapą
  kreator/                  Zgłoś rozwiązanie (kreator pomysłów)
  granty/generator/         szkic wniosku o grant (AI)
  test/[id]/                zapisy do testu i plakat z QR
  panel/                    Panel ROPS
  deklaracja-dostepnosci/   deklaracja dostępności
  api/geocode/              wyszukiwanie adresów (OpenStreetMap Nominatim)
  actions/                  Server Actions (Supabase, Gemini, Resend)
components/                 komponenty aplikacji
components/ui/              komponenty shadcn/ui
lib/                        klient Supabase, funkcje AI, role (role.ts)
seed/                       dane przykładowe (wyzwania ze słowami kluczowymi)
prezentacja/                prezentacja projektu (PowerPoint)
```

## Dane

Wszystkie dane w projekcie są fikcyjne i służą do demonstracji.
