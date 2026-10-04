// Tymczasowe dane demo. Później podmienimy na akcje backendu (app/actions.ts) — wszystko w tym jednym pliku.
import type { CanvasData } from "@/lib/ai"

import challengesData from "./challenges.json"
import reviewsData from "./reviews.json"
import solutionsData from "./solutions.json"

export type Stage = "pomysł" | "pilotaż" | "sprawdzona"

export type Challenge = {
  id: string
  name: string
  summary: string
  icon: string
  /** Początki słów (małe litery) — po nich biblioteka dopasowuje innowacje do wyzwania. */
  keywords: string[]
}

export type Solution = {
  id: string
  title: string
  problem: string
  method: string
  effect: string
  resources: string
  audience: string
  stage: Stage
  challenge_ids: string[]
  video_url: string | null
  organization: string
}

export type Review = {
  solution_id: string
  rating: number
  comment: string
}

export const STAGES: Stage[] = ["pomysł", "pilotaż", "sprawdzona"]

// Pola kanwy innowacji — te same w kreatorze i na stronie pomysłu.
export const CANVAS_FIELDS: { key: keyof CanvasData; label: string }[] = [
  { key: "problem_definition", label: "Jaki problem rozwiązuje?" },
  { key: "target_group_needs", label: "Czego potrzebują odbiorcy?" },
  { key: "innovative_aspect", label: "Co w nim jest nowego?" },
  { key: "expected_outcomes", label: "Jakie będą efekty?" },
  { key: "potential_risks", label: "Ryzyka i bariery" },
]

// Opcje formularza „Zgłoś problem” — te same wartości filtruje Panel ROPS.
// Role jak w lib/schemas.ts (needSchema.author_role).
export const REPORT_ROLES = [
  { value: "resident", label: "Mieszkaniec", hint: "Zgłaszam problem z mojej okolicy." },
  { value: "ngo", label: "Organizacja", hint: "Działam w stowarzyszeniu lub fundacji." },
  { value: "official", label: "Gmina lub samorząd", hint: "Pracuję w urzędzie lub jednostce gminy." },
] as const

export type ReportRole = (typeof REPORT_ROLES)[number]["value"]

// Formularz „Zadaj pytanie”. Wartości adresata jak w kolumnie messages.recipient.
export const MESSAGE_RECIPIENTS = [
  { value: "rops", label: "ROPS Kraków", hint: "Nabory, wdrożenie innowacji, współpraca z gminą." },
  { value: "mentor", label: "Mentor", hint: "Ekspert podpowie, jak rozwinąć pomysł albo wdrożyć rozwiązanie." },
] as const

export type MessageRecipient = (typeof MESSAGE_RECIPIENTS)[number]["value"]

export const MESSAGE_TOPICS = [
  "Pytanie o innowację",
  "Pomoc przy pomyśle",
  "Wdrożenie w gminie",
  "Szukam partnera",
  "Inne",
]

export const REPORT_AUDIENCES = [
  "Seniorzy",
  "Dzieci i młodzież",
  "Rodziny",
  "Osoby z niepełnosprawnościami",
  "Wszyscy mieszkańcy",
]

const solutions = solutionsData as Solution[]
const challenges: Challenge[] = challengesData
const reviews: Review[] = reviewsData

export function getSolutions({
  q,
  challenge,
  audience,
  stage,
}: {
  q?: string
  challenge?: string
  audience?: string
  stage?: string
} = {}) {
  const query = q?.trim().toLocaleLowerCase("pl")
  return solutions.filter(
    (s) =>
      (!query ||
        [s.title, s.problem, s.method, s.effect, s.organization].some((t) =>
          t.toLocaleLowerCase("pl").includes(query)
        )) &&
      (!challenge || s.challenge_ids.includes(challenge)) &&
      (!audience || s.audience === audience) &&
      (!stage || s.stage === stage)
  )
}

export function getSolution(id: string) {
  return solutions.find((s) => s.id === id)
}

export function getChallenges() {
  return challenges
}

export function getAudiences() {
  return [...new Set(solutions.map((s) => s.audience))].sort((a, b) =>
    a.localeCompare(b, "pl")
  )
}

export function getReviews(solutionId: string) {
  return reviews.filter((r) => r.solution_id === solutionId)
}

export function getRating(solutionId: string) {
  const list = getReviews(solutionId)
  const average = list.length
    ? list.reduce((sum, r) => sum + r.rating, 0) / list.length
    : 0
  return { average, count: list.length }
}
