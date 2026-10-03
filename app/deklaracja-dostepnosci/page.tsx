import type { Metadata } from "next"

export const metadata: Metadata = { title: "Deklaracja dostępności" }

// Wersja demo — przed wdrożeniem uzupełnić datami i danymi kontaktowymi ROPS.
export default function Page() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-4xl font-bold">Deklaracja dostępności</h1>
      <p>
        Serwis Podaj Dalej Małopolskiego Hubu Innowacji Społecznych ma spełniać wymagania WCAG 2.1 na
        poziomie AA.
      </p>
      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Ułatwienia</h2>
        <ul className="list-disc pl-6">
          <li>Przycisk „A+” w nagłówku powiększa tekst.</li>
          <li>Przycisk ze słońcem i księżycem włącza tryb jasny lub ciemny.</li>
          <li>Link „Przejdź do treści” pomija menu.</li>
          <li>Całą stronę obsłużysz klawiaturą.</li>
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Kontakt</h2>
        <p>
          Jeśli coś nie działa, napisz do nas:{" "}
          <a href="mailto:dostepnosc@example.com" className="underline underline-offset-4">
            dostepnosc@example.com
          </a>
          .
        </p>
      </section>
    </article>
  )
}
