// Role w demo bez logowania. Wybraną rolę trzyma ciasteczko — czyta ją serwer, ustawia przełącznik w nagłówku.
// ponytail: każdy może wybrać „ROPS”; przy prawdziwym logowaniu rolę ustala konto, nie ciasteczko.
export const ROLES = [
  { value: "resident", label: "Mieszkaniec" },
  { value: "ngo", label: "Organizacja" },
  { value: "jst", label: "Samorząd" },
  { value: "admin", label: "ROPS" },
  { value: "expert", label: "Ekspert" },
] as const

export type Role = (typeof ROLES)[number]["value"]

export const ROLE_COOKIE = "role"

export const toRole = (value?: string): Role =>
  ROLES.find((role) => role.value === value)?.value ?? "resident"

/** Działania na stronie innowacji — pierwsze na liście jest wyróżnione. */
export type InnovationAction = "gmina" | "test" | "plakat" | "opinia" | "kreator" | "panel" | "pytanie"

// Czym różnią się role: opis i główne działanie na stronie głównej oraz przyciski na stronie innowacji.
export const ROLE_VIEW: Record<Role, { lead: string; main: { href: string; label: string }; innovation: InnovationAction[] }> = {
  // Moduły I (matchmaking) i IV (tester)
  resident: {
    lead: "Opisz problem w swojej okolicy. Pokażemy, jak inne gminy już go rozwiązały.",
    main: { href: "/zglos", label: "Zgłoś problem" },
    innovation: ["test", "opinia", "pytanie"],
  },
  // Moduły III (kreator) i IV (organizacja testu)
  ngo: {
    lead: "Zgłoś swoje rozwiązanie, rozwiń je z asystentem AI i przygotuj wniosek o grant.",
    main: { href: "/kreator", label: "Zgłoś rozwiązanie" },
    innovation: ["plakat", "kreator", "pytanie"],
  },
  // Moduły II (biblioteka) i VII (dostosuj do gminy)
  jst: {
    lead: "Znajdź sprawdzone rozwiązanie, dostosuj je do swojej gminy z pomocą AI i przetestuj z mieszkańcami.",
    main: { href: "/biblioteka", label: "Znajdź rozwiązanie dla gminy" },
    innovation: ["gmina", "plakat", "pytanie"],
  },
  // Moduł VI (panel administratora)
  admin: {
    lead: "Weryfikuj nowe innowacje, odpowiadaj na zgłoszenia i wiadomości, prowadź nabory.",
    main: { href: "/panel", label: "Otwórz Panel ROPS" },
    innovation: ["panel", "gmina"],
  },
  // Moduł IV (ocena innowacji)
  expert: {
    lead: "Oceniaj innowacje i pomagaj gminom wybrać rozwiązania warte wdrożenia.",
    main: { href: "/biblioteka", label: "Oceń innowacje" },
    innovation: ["opinia", "gmina"],
  },
}
