// Stały format daty (bez Intl), żeby serwer i przeglądarka wyświetlały to samo.
const MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

const INNOWACJE = { one: "innowacja", few: "innowacje", many: "innowacji", other: "innowacji" }

export const innowacje = (n: number) =>
  `${n} ${INNOWACJE[new Intl.PluralRules("pl").select(n) as keyof typeof INNOWACJE]}`
