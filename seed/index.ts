// Tymczasowe dane demo. Później podmienimy na akcje backendu (app/actions.ts) — wszystko w tym jednym pliku.
import challengesData from "./challenges.json"
import reviewsData from "./reviews.json"
import solutionsData from "./solutions.json"

export type Stage = "pomysł" | "pilotaż" | "sprawdzona"

export type Challenge = {
  id: string
  name: string
  summary: string
  icon: string
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
