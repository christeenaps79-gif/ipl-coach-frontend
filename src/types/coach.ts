export type DecisionType =
  | 'STRONG_POSITIVE'
  | 'POSITIVE'
  | 'BALANCED'
  | 'NEGATIVE'
  | 'STRONG_NEGATIVE';

export interface CoachRecommendationRecord {
  venue: string;
  team: string;
  opponent: string;
  venueWinPct: number;
  overallWinPct: number;
  matches: number;
  wins: number;
  losses: number;
  winPct: number;
  tossWins: number;
  tossLosses: number;
  tossWinMatchWins: number;
  tossWinMatchLosses: number;
  tossConversionPct: number;
  batFirst: number;
  batFirstWins: number;
  batFirstWinPct: number;
  fieldFirst: number;
  fieldFirstWins: number;
  fieldFirstWinPct: number;
  overallConfidence: string;
  recommendation: string;
  tossRecommendation: string;
  strategyRecommendation: string;
  venueConfidence: string;
  performanceScore: number;
  strategyBonus: number;
  tossBonus: number;
  finalScore: number;
  finalDecision: DecisionType;
  decisionConfidence: string;
  strategySignal: string;
  tossSignal: string;
}

export interface MetricExplanation {
  title: string;
  rawMetric: string;
  value: string;
  cricketMeaning: string;
  tacticalImpact: string;
  confidenceWarning?: string;
}