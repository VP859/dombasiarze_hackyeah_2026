// Podobieństwo (cosinus) poniżej progu to już szum — np. „dziura w drodze” daje ~0,63 z każdą innowacją.
// ponytail: próg dobrany ręcznie na 31 innowacjach; przy większej bibliotece sprawdzić go od nowa.
export const MIN_SIMILARITY = 0.65;
// Zgłoszenie do zgłoszenia (oba jako zapytania) ma wyższy poziom bazowy: podobne ≥ 0,80, niepowiązane ≤ 0,71.
export const MIN_NEED_SIMILARITY = 0.75;

export interface SolutionMatch {
  id: string;
  title: string;
  problem: string;
  method: string;
  similarity: number;
}

export interface NeedMatch {
  id: string;
  description: string;
  gmina: string;
  similarity: number;
}

export interface MatchmakingAnalysis {
  category: string;
  key_challenges: string[];
  suggested_action: string;
  confidence_score: number;
}

export interface MatchmakingResult {
  needId: string;
  description: string;
  analysis: MatchmakingAnalysis | null;
  matchedSolutions: SolutionMatch[];
  matchedNeeds: NeedMatch[];
}