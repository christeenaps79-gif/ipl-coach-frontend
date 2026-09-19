const API_BASE_URL = "";

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

  finalDecision: string;
  decisionConfidence: string;

  strategySignal: string;
  tossSignal: string;
}

interface ApiResponse {
  status: string;
  data: CoachRecommendationRecord;
}

export async function getCoachRecommendation(
  venue: string,
  team: string,
  opponent: string
): Promise<CoachRecommendationRecord> {
  const params = new URLSearchParams({
    venue,
    team,
    opponent,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/coach-recommendation?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const result: ApiResponse = await response.json();

  if (result.status !== "success") {
    throw new Error("Backend returned an unsuccessful response");
  }

  return result.data;
}