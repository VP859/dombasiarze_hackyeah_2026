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
  analysis: MatchmakingAnalysis;
  matchedSolutions: SolutionMatch[];
  matchedNeeds: NeedMatch[];
}