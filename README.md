# Podaj Dalej — nie wymyślaj koła na nowo

Platforma Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków), przygotowana na HackYeah 2026.

Łączy problemy społeczne zgłaszane przez mieszkańców, organizacje i gminy z gotowymi innowacjami społecznymi. Pomaga dostosować sprawdzone rozwiązanie do konkretnej gminy, przetestować je z mieszkańcami i rozwijać nowe pomysły.

## Problem

Gminy często tworzą od zera rozwiązania, które gdzie indziej już działają. Wiedza o sprawdzonych innowacjach jest rozproszona, a dostosowanie ich do lokalnych warunków wymaga czasu i ekspertów.

## Co potrafi aplikacja

| Moduł ROPS | W aplikacji | Trasa | Stan |
| --- | --- | --- | --- |
| I. Matchmaking | Zgłoś problem | `/zglos`, `/zglos-zapotrzebowanie` | Zapis zgłoszenia i analiza AI działają, dopasowania wymagają embeddingów innowacji |
| II. Zasobnik wiedzy | Biblioteka, wyzwania, strona innowacji | `/biblioteka`, `/innowacja/[id]`, `/wyzwania` | Działa (Supabase) |
| III. Kreator pomysłów | Zgłoś rozwiązanie | `/kreator`, `/kreator/[id]` | Widok poglądowy |
| IV. Tester innowacji | Zapisy do testu, plakat z QR, opinie | `/test/[id]`, `/test/[id]/plakat` | Plakat i opinie działają, zapisy jeszcze bez bazy |
| V. Komunikacja | Wątek z ROPS | w „Zgłoś rozwiązanie” | Widok poglądowy |
| VI. Panel administratora | Panel ROPS | `/panel` | Widok poglądowy z podglądem innowacji |
| VII. Middleman | Dostosuj do gminy | `/innowacja/[id]/gmina` | Działa (Gemini) |

### Najważniejsze funkcje

- **Biblioteka innowacji:** wyszukiwarka i filtry (etap, odbiorcy), wyniki z bazy Supabase, karty z ocenami.
- **Strona innowacji:** problem, rozwiązanie, efekty, potrzebne zasoby, materiały źródłowe, oceny i formularz dodawania opinii (działa też bez JavaScriptu).
- **Dostosuj do gminy:** gmina podaje nazwę, liczbę mieszkańców, typ, budżet i lokalne wyzwania, a asystent AI przygotowuje plan wdrożenia: kroki, możliwe bariery, budżet i źródła finansowania, wskaźniki sukcesu.
- **Zgłaszanie problemu:** opis potrzeby także głosem (rozpoznawanie mowy wbudowane w przeglądarkę, bez wysyłania nagrania na serwer), zapis do bazy, analiza AI i wyszukiwanie podobnych innowacji (embeddingi + pgvector).
- **Tester:** plakat do wydruku z kodem QR prowadzącym do zapisów na test.
- **Panel ROPS:** weryfikacja nowych innowacji z podglądem, zgłoszenia potrzeb, wiadomości i nabory.

## Dostępność (WCAG 2.1 AA)

- Język strony `pl`, unikalne tytuły, link „Przejdź do treści”, jeden nagłówek `h1` i nagłówki po kolei, landmarki.
- Pełna obsługa klawiaturą i widoczny fokus.
- Tekst bazowy 18 px, przycisk **A+** do powiększania tekstu (zapamiętywany), przyciski i pola min. 44 px.
- Tryb jasny i ciemny.
- Każde pole ma widoczną etykietę, a błędy są opisane słowami.
- Wyniki i stany ładowania ogłaszane przez `aria-live`.
- Działa przy szerokości 320 px i powiększeniu 200%. Przyklejony nagłówek przy dużym powiększeniu się odkleja.
- Animacje tylko przy `prefers-reduced-motion: no-preference`.
- [Deklaracja dostępności](app/deklaracja-dostepnosci/page.tsx) i prosty język.

## Technologia

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions), TypeScript
- Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) (Base UI), lucide-react
- [Supabase](https://supabase.com): Postgres + pgvector
- Google Gemini: analiza zgłoszeń, embeddingi, plany wdrożenia
- Leaflet: mapa w zgłoszeniu problemu

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
  zglos/, zglos-zapotrzebowanie/   zgłaszanie problemu
  kreator/                  Zgłoś rozwiązanie (kreator pomysłów)
  test/[id]/                zapisy do testu i plakat z QR
  panel/                    Panel ROPS
  actions/                  Server Actions (Supabase, Gemini)
components/                 komponenty aplikacji
components/ui/              komponenty shadcn/ui
lib/                        klient Supabase, funkcje AI
seed/                       dane przykładowe (wyzwania)
```

## Dane

Wszystkie dane w projekcie są fikcyjne i służą do demonstracji.
