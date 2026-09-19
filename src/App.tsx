import { useEffect, useMemo, useState, type ReactNode } from "react";
import IntroAnimation from "./components/IntroAnimation";

import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChevronRight,
  Crosshair,
  Database,
  Gauge,
  History,
  Radar,
  Swords,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import "./App.css";
import "./polish.css";
const API = "";
const INFERENCE_API =
  import.meta.env.VITE_INFERENCE_API_URL || "http://localhost:5001";

/* ============================================================
   SYSTEM STYLES
   ============================================================ */

const systemStyles = `
.system-shell {
  min-height: 100vh;
  position: relative;
}

.system-workspace {
  position: relative;
  z-index: 2;
}

.system-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 24px;
}

.system-heading-copy {
  min-width: 0;
}

.system-heading h1 {
  margin: 0 0 7px;
  font-size: clamp(22px, 3vw, 34px);
  letter-spacing: -0.025em;
  font-weight: 650;
}

.system-heading p {
  margin: 0;
  color: var(--text-muted, #8b949e);
  font-size: 11px;
  line-height: 1.6;
  max-width: 760px;
}

.system-clock {
  font-family: var(--mono, monospace);
  font-size: 10px;
  color: var(--text-muted, #8b949e);
  white-space: nowrap;
}

.calculation-panel {
  position: relative;
  border: 1px solid var(--border, rgba(255,255,255,.1));
  background: var(--panel, rgba(10,14,20,.82));
  padding: 18px;
  margin-bottom: 18px;
}

.calculation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 18px;
}

.calculation-state {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mono, monospace);
  font-size: 9px;
  letter-spacing: .1em;
}

.calculation-state.READY {
  color: #8b949e;
}

.calculation-state.PROCESSING {
  color: #d29922;
}

.calculation-state.RESULT_AVAILABLE {
  color: #3fb950;
}

.calculation-state.ERROR {
  color: #f85149;
}

.calculation-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.calculation-state.PROCESSING .calculation-dot {
  animation: calculationPulse 1s infinite;
}

@keyframes calculationPulse {
  0%, 100% { opacity: .35; }
  50% { opacity: 1; }
}

/* ============================================================
   BUTTON NORMALIZATION
   ============================================================ */

button {
  font: inherit;
}

.btn,
.system-control,
.workspace-row,
.tab {
  appearance: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
}

.btn {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 9px 14px;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 0 !important;
  outline: none;
  background: #0d131b !important;
  background-color: #0d131b !important;
  color: #d7dee6 !important;
  box-shadow: none !important;
  font-family: var(--mono, monospace);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .08em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color .18s ease,
    background-color .18s ease,
    color .18s ease,
    transform .18s ease;
}

.btn:hover {
  background: #151d27 !important;
  background-color: #151d27 !important;
  border-color: rgba(255,255,255,.30) !important;
  color: #f1f5f9 !important;
}

.btn:active {
  transform: translateY(1px);
  background: #0a0f16 !important;
}

.btn:disabled {
  opacity: .5 !important;
  cursor: wait !important;
}

.btn svg {
  flex-shrink: 0;
}

.workspace-row {
  width: 100%;
  min-width: 0;
  appearance: none;
  border: 0 !important;
  border-bottom: 1px solid var(--border, rgba(255,255,255,.08)) !important;
  border-radius: 0 !important;
  background: var(--panel, #0a0e14) !important;
  background-color: var(--panel, #0a0e14) !important;
  color: var(--text, #e6edf3) !important;
  box-shadow: none !important;
  text-align: left;
  cursor: pointer;
  transition:
    background-color .18s ease,
    padding-left .18s ease;
}

.workspace-row:hover,
.workspace-row:focus,
.workspace-row:active {
  background: #0f151e !important;
  background-color: #0f151e !important;
  color: #f1f5f9 !important;
  outline: none;
}

.workspace-row:hover {
  padding-left: 5px;
}

.tab {
  appearance: none;
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* ============================================================ */

.operation-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--border, rgba(255,255,255,.1));
  border: 1px solid var(--border, rgba(255,255,255,.1));
}

.operation-item {
  background: var(--panel, #0a0e14);
  padding: 15px;
}

.operation-number {
  font-family: var(--mono, monospace);
  font-size: 8px;
  color: var(--text-muted, #8b949e);
  margin-bottom: 8px;
}

.operation-item strong {
  display: block;
  font-size: 11px;
  margin-bottom: 5px;
}

.operation-item span {
  color: var(--text-muted, #8b949e);
  font-size: 10px;
  line-height: 1.5;
}

.system-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border, rgba(255,255,255,.1));
  background: transparent;
  color: var(--text, #e6edf3);
  padding: 9px 13px;
  font-family: var(--mono, monospace);
  font-size: 9px;
  letter-spacing: .08em;
  cursor: pointer;
  transition: .2s ease;
}

.system-control:hover {
  border-color: rgba(255,255,255,.28);
  background: rgba(255,255,255,.025);
}

.system-control.primary {
  border-color: rgba(88,166,255,.35);
}

.system-control.processing {
  opacity: .65;
  cursor: wait;
}

.module-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.calculation-log {
  border-left: 2px solid rgba(88,166,255,.3);
  padding: 9px 12px;
  margin-top: 12px;
  font-family: var(--mono, monospace);
  font-size: 9px;
  color: var(--text-muted, #8b949e);
  line-height: 1.7;
}

.result-banner {
  border: 1px solid var(--border, rgba(255,255,255,.1));
  padding: 17px;
  margin-bottom: 16px;
}

.system-note {
  border-top: 1px solid var(--border, rgba(255,255,255,.1));
  padding: 11px 0;
  font-size: 10px;
  line-height: 1.7;
  color: var(--text-muted, #8b949e);
}

.system-note strong {
  color: var(--text, #e6edf3);
  font-family: var(--mono, monospace);
  font-size: 8px;
  letter-spacing: .12em;
}

.module-description {
  margin: 0 0 18px;
  color: var(--text-muted, #8b949e);
  font-size: 10px;
  line-height: 1.65;
  max-width: 850px;
}

.workspace-row .module-description {
  margin: 0;
}

.analysis-source {
  margin-top: 12px;
  font-family: var(--mono, monospace);
  color: var(--text-muted, #8b949e);
  font-size: 8px;
  letter-spacing: .08em;
}

.player-query-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;
}

.player-subsection {
  margin-top: 20px;
}

.player-subsection-title {
  font-family: var(--mono, monospace);
  font-size: 8px;
  letter-spacing: .13em;
  color: var(--text-muted, #8b949e);
  margin-bottom: 10px;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--border, rgba(255,255,255,.1));
}

.record-cell {
  padding: 13px;
  border-right: 1px solid var(--border, rgba(255,255,255,.1));
  border-bottom: 1px solid var(--border, rgba(255,255,255,.1));
}

.record-cell:nth-child(4n) {
  border-right: none;
}

.record-cell-label {
  font-family: var(--mono, monospace);
  font-size: 8px;
  color: var(--text-muted, #8b949e);
  letter-spacing: .08em;
  margin-bottom: 7px;
}

.record-cell-value {
  font-size: 17px;
  font-weight: 600;
}

.inference-block {
  margin-top: 20px;
  border-top: 1px solid var(--border, rgba(255,255,255,.1));
}

.inference-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
  padding: 13px 0 8px;
}

.inference-heading strong {
  font-family: var(--mono, monospace);
  font-size: 9px;
  letter-spacing: .13em;
}

.inference-heading span {
  font-family: var(--mono, monospace);
  font-size: 8px;
  color: var(--text-muted, #8b949e);
}

.inference-row {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 18px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border, rgba(255,255,255,.08));
}

.inference-label {
  font-family: var(--mono, monospace);
  font-size: 8px;
  letter-spacing: .11em;
  color: var(--text-muted, #8b949e);
}

.inference-text {
  font-size: 10px;
  line-height: 1.7;
  color: var(--text, #e6edf3);
}

.inference-row.suggestion .inference-text {
  color: #d8dee4;
}

.inference-row.limit .inference-text {
  color: var(--text-muted, #8b949e);
}

.coach-layout {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 18px;
}

.coach-result-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.decision-box {
  font-family: var(--mono, monospace);
}

.decision-box small {
  display: block;
  font-size: 8px;
  color: var(--text-muted, #8b949e);
  letter-spacing: .1em;
  margin-bottom: 7px;
}

.decision-box strong {
  font-size: 16px;
  letter-spacing: .04em;
}

.score-box {
  text-align: right;
}

.score-box small {
  display: block;
  color: var(--text-muted, #8b949e);
  font-family: var(--mono, monospace);
  font-size: 8px;
  margin-bottom: 5px;
}

.score-box strong {
  font-size: 30px;
  font-family: var(--mono, monospace);
}

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--border, rgba(255,255,255,.1));
}

.evidence-cell {
  padding: 12px;
  border-right: 1px solid var(--border, rgba(255,255,255,.1));
  border-bottom: 1px solid var(--border, rgba(255,255,255,.1));
}

.evidence-cell:nth-child(4n) {
  border-right: none;
}

.evidence-cell-label {
  font-family: var(--mono, monospace);
  font-size: 8px;
  color: var(--text-muted, #8b949e);
  letter-spacing: .08em;
  margin-bottom: 6px;
}

.evidence-cell-value {
  font-family: var(--mono, monospace);
  font-size: 14px;
}

.trace-line {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
  font-family: var(--mono, monospace);
  font-size: 10px;
}

.trace-item {
  padding: 8px 10px;
  border: 1px solid var(--border, rgba(255,255,255,.1));
}

.trace-arrow {
  color: var(--text-muted, #8b949e);
}

.warning-note {
  margin-top: 14px;
  border-left: 2px solid #d29922;
  padding: 8px 11px;
  color: var(--text-muted, #8b949e);
  font-size: 9px;
  line-height: 1.6;
}

.workspace-list {
  border-top: 1px solid var(--border, rgba(255,255,255,.1));
}

.workspace-row {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border, rgba(255,255,255,.08));
}

.workspace-row-number {
  font-family: var(--mono, monospace);
  color: var(--text-muted, #8b949e);
  font-size: 9px;
}

.workspace-open {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--mono, monospace);
  font-size: 8px;
  color: var(--text-muted, #8b949e);
}

.workspace-row:hover .workspace-open {
  color: #d7dee6;
}

/* ============================================================
   VENUE CHOOSER
   ============================================================ */

.venue-selection {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.venue-selected {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  padding: 9px 13px;
  border: 1px solid var(--border, rgba(255,255,255,.1));
  background: rgba(255,255,255,.025);
  color: var(--text, #e6edf3);
  font-family: var(--mono, monospace);
  font-size: 9px;
  letter-spacing: .05em;
}

.venue-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0,0,0,.72);
  backdrop-filter: blur(5px);
}

.venue-modal {
  width: min(680px, 100%);
  max-height: min(760px, 90vh);
  overflow: auto;
  border: 1px solid rgba(255,255,255,.14);
  background: #090d13;
  box-shadow: 0 30px 80px rgba(0,0,0,.55);
}

.venue-modal-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 18px;
  border-bottom: 1px solid var(--border, rgba(255,255,255,.1));
}

.venue-modal-header strong {
  display: block;
  font-family: var(--mono, monospace);
  font-size: 10px;
  letter-spacing: .12em;
  margin-bottom: 6px;
}

.venue-modal-header span {
  display: block;
  color: var(--text-muted, #8b949e);
  font-size: 9px;
  line-height: 1.5;
}

.venue-modal-close {
  border: 1px solid var(--border, rgba(255,255,255,.1));
  background: transparent;
  color: var(--text-muted, #8b949e);
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.venue-modal-close:hover {
  color: var(--text, #e6edf3);
  border-color: rgba(255,255,255,.3);
}

.venue-option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--border, rgba(255,255,255,.08));
}

.venue-option {
  min-height: 62px;
  border: 0;
  border-radius: 0;
  background: #0d131b;
  color: #d7dee6;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  font-family: var(--mono, monospace);
  font-size: 9px;
  transition: background .18s ease, color .18s ease;
}

.venue-option:hover {
  background: #151d27;
  color: #f1f5f9;
}

.venue-option.selected {
  background: #17202c;
  color: #fff;
}

.venue-modal-footer {
  padding: 13px 18px;
  border-top: 1px solid var(--border, rgba(255,255,255,.1));
  color: var(--text-muted, #8b949e);
  font-family: var(--mono, monospace);
  font-size: 8px;
  line-height: 1.6;
}

/* ============================================================ */

@media (max-width: 900px) {
  .operation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .coach-layout {
    grid-template-columns: 1fr;
  }

  .record-grid,
  .evidence-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .record-cell:nth-child(4n),
  .evidence-cell:nth-child(4n) {
    border-right: 1px solid var(--border, rgba(255,255,255,.1));
  }

  .record-cell:nth-child(2n),
  .evidence-cell:nth-child(2n) {
    border-right: none;
  }
}

@media (max-width: 650px) {
  .system-heading,
  .calculation-header,
  .coach-result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .player-query-grid {
    grid-template-columns: 1fr;
  }

  .operation-grid,
  .record-grid,
  .evidence-grid {
    grid-template-columns: 1fr;
  }

  .record-cell,
  .evidence-cell {
    border-right: none !important;
  }

  .inference-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .score-box {
    text-align: left;
  }

  .workspace-row {
    grid-template-columns: 30px 1fr;
  }

  .workspace-open {
    display: none;
  }

  .venue-option-grid {
    grid-template-columns: 1fr;
  }
}
`;

/* ============================================================
   DATA
   ============================================================ */

const TEAMS = [
  "Chennai Super Kings",
  "Delhi Capitals",
  "Mumbai Indians",
  "Kolkata Knight Riders",
  "Royal Challengers Bengaluru",
  "Rajasthan Royals",
  "Punjab Kings",
  "Sunrisers Hyderabad",
  "Gujarat Titans",
  "Lucknow Super Giants",
];

/*
 * These are the venue choices currently exposed in the frontend.
 * The chooser deliberately replaces free-text entry.
 *
 * The backend may contain additional historical venues. If a venue
 * is not present here, it should be added to this controlled list
 * rather than allowing arbitrary free-text input.
 */
const VENUES = [
  "Arun Jaitley Stadium",
  "M Chinnaswamy Stadium",
  "Wankhede Stadium",
  "MA Chidambaram Stadium",
  "Eden Gardens",
  "Rajiv Gandhi International Stadium",
  "Dubai International Cricket Stadium",
  "Narendra Modi Stadium",
  "Punjab Cricket Association IS Bindra Stadium",
  "Sawai Mansingh Stadium",
  "Rajiv Gandhi International Cricket Stadium",
  "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium",
  "Dr DY Patil Sports Academy",
  "Brabourne Stadium",
  "Himachal Pradesh Cricket Association Stadium",
  "Barsapara Cricket Stadium",
  "JSCA International Stadium Complex",
  "MA Chidambaram Stadium, Chepauk",
];

type Player = {
  player: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  wickets: number;
  bowlingBalls: number;
  runsConceded: number;
  economy: number;
  matches: number;
  dismissals: number;
};

type Team = {
  team: string;
  matches: number;
  wins: number;
  losses: number;
  winPct: number;
};

type DashboardData = {
  summary: {
    coachRecords: number;
    deliveries: number;
    matches: number;
    playerBattles: number;
    players: number;
    teams: number;
    venues: number;
  };
};

type CoachData = {
  team: string;
  opponent: string;
  venue: string;
  finalScore?: number;
  performanceScore?: number;
  finalDecision?: string;
  decisionConfidence?: string;
  venueConfidence?: string;
  overallConfidence?: string;
  venueWinPct?: number;
  overallWinPct?: number;
  matches?: number;
  wins?: number;
  losses?: number;
  recommendation?: string;
  batFirst?: number;
  batFirstWinPct?: number;
  batFirstWins?: number;
  fieldFirst?: number;
  fieldFirstWinPct?: number;
  fieldFirstWins?: number;
  strategySignal?: string;
  strategyBonus?: number;
  strategyRecommendation?: string;
  tossWins?: number;
  tossLosses?: number;
  tossConversionPct?: number;
  tossWinMatchWins?: number;
  tossWinMatchLosses?: number;
  tossSignal?: string;
  tossBonus?: number;
  tossRecommendation?: string;
};

type H2H = {
  team: string;
  opponent: string;
  matches: number;
  teamWins: number;
  opponentWins: number;
  draws: number;
};

type VenueData = {
  venue: string;
  matches: number;
  teams: Record<
    string,
    {
      matches: number;
      wins: number;
      winPct: number;
    }
  >;
};

type Battle = {
  batter: string;
  bowler: string;
  balls: number;
  runs: number;
  fours: number;
  sixes: number;
  dots: number;
  strikeRate: number;
  wickets: number;
};

type Inference = {
  meaning: string;
  suggestion: string;
  limitation: string;
  source?: string;
};

type CalculationState =
  | "READY"
  | "PROCESSING"
  | "RESULT AVAILABLE"
  | "ERROR";

/* ============================================================
   HELPERS
   ============================================================ */

function safeNumber(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value: unknown, digits = 2): string {
  const number = safeNumber(value);

  if (number === null) {
    return "—";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function percent(value: unknown): string {
  const number = safeNumber(value);

  if (number === null) {
    return "—";
  }

  return `${formatNumber(number)}%`;
}

function calculatePercent(
  numerator: number,
  denominator: number,
): number {
  if (!denominator) {
    return 0;
  }

  return (numerator / denominator) * 100;
}

function sampleLanguage(matches: number | undefined): string {
  const n = safeNumber(matches);

  if (n === null || n < 3) {
    return "The returned sample is small, so this signal should be treated as directional rather than conclusive.";
  }

  if (n < 10) {
    return "The returned sample is usable for historical context, but it is still limited for strong conclusions.";
  }

  return "The returned sample provides a broader historical base for this calculation.";
}

/* ============================================================
   DETERMINISTIC INFERENCE
   ============================================================ */

function inferPlayer(player: Player): Inference {
  const sr = safeNumber(player.strikeRate);
  const economy = safeNumber(player.economy);
  const balls = safeNumber(player.balls) ?? 0;
  const bowlingBalls = safeNumber(player.bowlingBalls) ?? 0;

  const dismissalRate =
    balls > 0
      ? calculatePercent(player.dismissals ?? 0, balls)
      : null;

  let battingMeaning =
    "The returned batting record does not provide enough information for a scoring-rate interpretation.";

  if (sr !== null) {
    if (sr >= 140) {
      battingMeaning =
        `Historical scoring rate is ${formatNumber(
          sr,
        )}, indicating a high scoring rate in the returned aggregate record.`;
    } else if (sr >= 110) {
      battingMeaning =
        `Historical scoring rate is ${formatNumber(
          sr,
        )}, indicating a moderate-to-strong scoring rate in the returned aggregate record.`;
    } else {
      battingMeaning =
        `Historical scoring rate is ${formatNumber(
          sr,
        )}, indicating a lower scoring rate in the returned aggregate record.`;
    }
  }

  let bowlingMeaning =
    "No bowling-rate interpretation is made because the returned record does not contain enough bowling workload.";

  if (bowlingBalls > 0 && economy !== null) {
    if (economy < 7) {
      bowlingMeaning =
        `Historical economy is ${formatNumber(
          economy,
        )}, indicating relatively controlled run concession in the returned bowling sample.`;
    } else if (economy <= 9) {
      bowlingMeaning =
        `Historical economy is ${formatNumber(
          economy,
        )}, indicating a mid-range run-concession rate in the returned bowling sample.`;
    } else {
      bowlingMeaning =
        `Historical economy is ${formatNumber(
          economy,
        )}, indicating a relatively high run-concession rate in the returned bowling sample.`;
    }
  }

  const suggestion =
    bowlingBalls > 0 && economy !== null
      ? "Use the batting and bowling rates as historical role indicators. Match them against opposition, phase and current form before final selection."
      : "Use the historical scoring record as a role indicator. Match it against opposition, phase and current form before final selection.";

  return {
    meaning: `${battingMeaning} ${bowlingMeaning}`,
    suggestion,
    limitation:
      `${sampleLanguage(player.matches)} ` +
      (dismissalRate !== null
        ? `The returned dismissal rate is ${formatNumber(
          dismissalRate,
        )}% of recorded batting balls.`
        : "Dismissal-rate interpretation is unavailable from the returned record."),
    source: "Player performance calculation",
  };
}

function inferDirectory(players: Player[]): Inference {
  if (!players.length) {
    return {
      meaning:
        "No roster records are currently loaded, so squad-level inference cannot be calculated.",
      suggestion:
        "Run the team directory calculation to load the historical player records.",
      limitation: "No player records returned.",
      source: "Team player records",
    };
  }

  const runLeader = [...players].sort(
    (a, b) => b.runs - a.runs,
  )[0];

  const wicketLeader = [...players].sort(
    (a, b) => b.wickets - a.wickets,
  )[0];

  const totalRuns = players.reduce(
    (sum, player) => sum + player.runs,
    0,
  );

  const totalWickets = players.reduce(
    (sum, player) => sum + player.wickets,
    0,
  );

  return {
    meaning:
      `${players.length} player records are loaded. ` +
      `${runLeader.player} has the highest returned aggregate run count at ${formatNumber(
        runLeader.runs,
        0,
      )}. ` +
      `${wicketLeader.player} has the highest returned wicket count at ${formatNumber(
        wicketLeader.wickets,
        0,
      )}. ` +
      `The loaded records contain ${formatNumber(
        totalRuns,
        0,
      )} aggregate runs and ${formatNumber(
        totalWickets,
        0,
      )} aggregate wickets.`,
    suggestion:
      `Use ${runLeader.player} as the primary historical batting reference and ${wicketLeader.player} as the primary historical bowling reference. Review the remaining squad records for role depth rather than treating aggregate totals as current form.`,
    limitation:
      "Directory records are aggregate historical records. They do not by themselves establish current availability, recent form or match-specific suitability.",
    source: "Team roster calculation",
  };
}

function inferTeam(team: Team): Inference {
  const winPct = safeNumber(team.winPct);
  const matches = safeNumber(team.matches) ?? 0;

  let meaning =
    "The returned team record does not contain enough information for a win-rate interpretation.";

  if (winPct !== null) {
    meaning =
      `The team has ${formatNumber(
        team.wins,
        0,
      )} wins from ${formatNumber(
        matches,
        0,
      )} returned matches, giving a historical win rate of ${formatNumber(
        winPct,
      )}%.`;
  }

  return {
    meaning,
    suggestion:
      "Use the historical team record to establish a baseline. For an actual match decision, combine it with opponent, venue and player-level evidence.",
    limitation: sampleLanguage(matches),
    source: "Team performance calculation",
  };
}

function inferH2H(record: H2H): Inference {
  const teamWins = safeNumber(record.teamWins) ?? 0;
  const opponentWins =
    safeNumber(record.opponentWins) ?? 0;
  const draws = safeNumber(record.draws) ?? 0;
  const matches = safeNumber(record.matches) ?? 0;

  let meaning = "";

  if (teamWins === opponentWins) {
    meaning =
      `The historical matchup is balanced: ${record.team} has ${teamWins} wins and ${record.opponent} has ${opponentWins} wins across ${matches} returned matches.`;
  } else if (teamWins > opponentWins) {
    meaning =
      `${record.team} has the stronger historical result count in the returned matchup, with ${teamWins} wins against ${opponentWins} for ${record.opponent}.`;
  } else {
    meaning =
      `${record.opponent} has the stronger historical result count in the returned matchup, with ${opponentWins} wins against ${teamWins} for ${record.team}.`;
  }

  if (draws > 0) {
    meaning += ` ${draws} returned match result(s) are recorded as draws/no-results.`;
  }

  return {
    meaning,
    suggestion:
      "Use the matchup record as historical context for preparation. Combine it with venue, current squad composition and player-battle evidence before making a match plan.",
    limitation: sampleLanguage(matches),
    source: "Head-to-head calculation",
  };
}

function inferVenue(record: VenueData): Inference {
  const entries = Object.entries(
    record.teams || {},
  ).filter(
    ([, value]) =>
      safeNumber(value.matches) !== null,
  );

  if (!entries.length) {
    return {
      meaning:
        "No team-level venue records were returned for this venue.",
      suggestion:
        "Use the venue calculation again after confirming the venue selection.",
      limitation:
        "No team-level venue records available.",
      source: "Venue intelligence calculation",
    };
  }

  const sorted = [...entries].sort(
    (a, b) =>
      (b[1].winPct ?? 0) -
      (a[1].winPct ?? 0),
  );

  const [historicalTeam, data] = sorted[0];

  return {
    meaning:
      `${record.venue} has ${formatNumber(
        record.matches,
        0,
      )} returned matches. ` +
      `${historicalTeam} has the highest returned venue win rate at ${formatNumber(
        data.winPct,
      )}% across ${formatNumber(
        data.matches,
        0,
      )} recorded matches.`,
    suggestion:
      `Treat ${historicalTeam}'s venue record as a historical venue signal. Compare the selected team's own venue record and the opponent's record before converting this into a match plan.`,
    limitation:
      record.matches < 3
        ? "The venue sample is small and should not be treated as a stable venue effect."
        : "Venue history remains historical evidence and does not account for current squad or match conditions.",
    source: "Venue intelligence calculation",
  };
}

function inferBattle(record: Battle): Inference {
  const balls = safeNumber(record.balls) ?? 0;
  const dots = safeNumber(record.dots) ?? 0;
  const wickets = safeNumber(record.wickets) ?? 0;

  const dotRate =
    balls > 0
      ? calculatePercent(dots, balls)
      : null;

  const dismissalRate =
    balls > 0
      ? calculatePercent(wickets, balls)
      : null;

  const sr = safeNumber(record.strikeRate);

  let meaning =
    `The returned batter-bowler sample contains ${formatNumber(
      balls,
      0,
    )} balls. `;

  if (sr !== null) {
    meaning += `The batter's recorded strike rate in this matchup is ${formatNumber(
      sr,
    )}. `;
  }

  if (dotRate !== null) {
    meaning += `The dot-ball rate is ${formatNumber(
      dotRate,
    )}%. `;
  }

  if (dismissalRate !== null) {
    meaning += `The recorded dismissal rate is ${formatNumber(
      dismissalRate,
    )}% of matchup balls.`;
  }

  return {
    meaning,
    suggestion:
      "Use this matchup as a specific tactical reference. A high dot-ball rate or repeated dismissals can support a matchup plan, while a high scoring rate can indicate the need for an alternative bowling option.",
    limitation:
      balls < 30
        ? "The matchup sample is small, so the observed pattern should be treated cautiously."
        : "The matchup is still historical and should be combined with current player form and phase context.",
    source: "Player battle calculation",
  };
}

function inferCoach(record: CoachData): Inference {
  const performance =
    safeNumber(record.performanceScore);

  const strategy =
    safeNumber(record.strategyBonus) ?? 0;

  const toss =
    safeNumber(record.tossBonus) ?? 0;

  const components = [
    {
      name: "performance",
      value: Math.abs(performance ?? 0),
    },
    {
      name: "strategy",
      value: Math.abs(strategy),
    },
    {
      name: "toss",
      value: Math.abs(toss),
    },
  ].sort((a, b) => b.value - a.value);

  const strongest = components[0]?.name;

  let meaning =
    `The backend returned a final score of ${formatNumber(
      record.finalScore,
    )}. `;

  if (performance !== null) {
    meaning += `The performance component is ${formatNumber(
      performance,
    )}. `;
  }

  meaning +=
    `Strategy contributes ${strategy >= 0 ? "+" : ""}${formatNumber(
      strategy,
    )} and toss contributes ${toss >= 0 ? "+" : ""}${formatNumber(
      toss,
    )}. `;

  if (record.finalDecision) {
    meaning += `The backend decision classification is ${record.finalDecision}.`;
  }

  let suggestion =
    "Use the final decision as a summary of the returned historical calculation, then inspect each evidence component before applying it to the match plan.";

  if (strongest === "performance") {
    suggestion =
      "Performance is the dominant returned component. Review venue and overall historical records first, then use strategy and toss evidence only as secondary modifiers.";
  } else if (
    strongest === "strategy" &&
    strategy !== 0
  ) {
    suggestion =
      "Strategy is materially affecting the calculation. Review the returned bat-first/field-first records before using the strategy signal in planning.";
  } else if (
    strongest === "toss" &&
    toss !== 0
  ) {
    suggestion =
      "Toss conversion is materially affecting the calculation. Treat it as a conditional factor because toss outcome is not controlled before the match.";
  }

  return {
    meaning,
    suggestion,
    limitation:
      record.matches !== undefined
        ? sampleLanguage(record.matches)
        : "Coach output is based on historical records returned by the backend.",
    source: "Coach decision calculation",
  };
}

/* ============================================================
   API
   ============================================================ */

async function getJSON<T>(
  url: string,
): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status})`,
    );
  }

  const json = await response.json();

  if (json?.status === "error") {
    throw new Error(
      json.message || "Backend returned an error",
    );
  }

  return json;
}

async function requestInference(
  module: string,
  data: unknown,
  fallback: Inference,
): Promise<Inference> {
  try {
    const response = await fetch(
      `${INFERENCE_API}/api/inference`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module,
          data,
        }),
      },
    );

    if (!response.ok) {
      return fallback;
    }

    const json = await response.json();

    if (
      json?.status === "success" &&
      json?.inference?.meaning &&
      json?.inference?.suggestion
    ) {
      return {
        meaning: json.inference.meaning,
        suggestion: json.inference.suggestion,
        limitation:
          json.inference.limitation ||
          fallback.limitation,
        source:
          "Generated coaching interpretation",
      };
    }
  } catch {
    // Deterministic fallback remains available.
  }

  return fallback;
}

/* ============================================================
   APP
   ============================================================ */

export default function App() {
  const [showIntro, setShowIntro] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("calculator");

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [rankings, setRankings] =
    useState<Player[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [selectedTeam, setSelectedTeam] =
    useState("Chennai Super Kings");

  const [selectedOpponent, setSelectedOpponent] =
    useState("Delhi Capitals");

  const [selectedVenue, setSelectedVenue] =
    useState("Arun Jaitley Stadium");

  const [teamPlayers, setTeamPlayers] =
    useState<Player[]>([]);

  const [directoryReady, setDirectoryReady] =
    useState(false);

  const [teamAnalysisReady, setTeamAnalysisReady] =
    useState(false);

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [coach, setCoach] =
    useState<CoachData | null>(null);

  const [h2h, setH2h] =
    useState<H2H | null>(null);

  const [venueData, setVenueData] =
    useState<VenueData | null>(null);

  const [battle, setBattle] =
    useState<Battle | null>(null);

  /* ============================================================
     PLAYER BATTLE STATE
     ============================================================ */

  const [battleTeam, setBattleTeam] =
    useState("Chennai Super Kings");

  const [battleOpponent, setBattleOpponent] =
    useState("Delhi Capitals");

  const [battleTeamPlayers, setBattleTeamPlayers] =
    useState<Player[]>([]);

  const [battleOpponentPlayers, setBattleOpponentPlayers] =
    useState<Player[]>([]);

  const [batter, setBatter] =
    useState("");

  const [bowler, setBowler] =
    useState("");

  const [battlePlayersLoading, setBattlePlayersLoading] =
    useState(false);

  const [playerSearch, setPlayerSearch] =
    useState("");

  const [playerSearchState, setPlayerSearchState] =
    useState<CalculationState>("READY");

  const [loading, setLoading] =
    useState(false);

  const [, setAnalysisStage] = useState("READY");;

  const [inferences, setInferences] =
    useState<Record<string, Inference>>({});

  useEffect(() => {
    const style =
      document.createElement("style");

    style.setAttribute(
      "data-stumps-system",
      "true",
    );

    style.textContent = systemStyles;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    loadDashboard();
    loadRankings();
    loadTeams();
    loadBattlePlayers(
      battleTeam,
      battleOpponent,
    );
  }, []);

  async function loadDashboard() {
    try {
      const result =
        await getJSON<DashboardData>(
          `${API}/api/dashboard`,
        );

      setDashboard(result);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRankings() {
    try {
      const result =
        await getJSON<{
          data: Player[];
        }>(
          `${API}/api/player-rankings`,
        );

      setRankings(
        Array.isArray(result.data)
          ? result.data
          : [],
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function loadTeams(): Promise<Team[]> {
    try {
      const result =
        await getJSON<{
          data?: Team[];
          teams?: Team[];
        }>(
          `${API}/api/team-performance`,
        );

      const loadedTeams =
        Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.teams)
            ? result.teams
            : [];

      setTeams(loadedTeams);

      return loadedTeams;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function loadTeamPlayers(
    team: string,
  ): Promise<Player[]> {
    const result =
      await getJSON<{
        data?: Player[];
        players?: Player[];
      }>(
        `${API}/api/team-players/${encodeURIComponent(
          team,
        )}`,
      );

    const players =
      Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.players)
          ? result.players
          : [];

    setTeamPlayers(players);

    return players;
  }

  async function loadBattlePlayers(
    team: string,
    opponent: string,
  ) {
    if (!team || !opponent || team === opponent) {
      return;
    }

    setBattlePlayersLoading(true);

    try {
      const [ourPlayers, opponentPlayers] =
        await Promise.all([
          getJSON<{
            data?: Player[];
            players?: Player[];
          }>(
            `${API}/api/team-players/${encodeURIComponent(
              team,
            )}`,
          ),
          getJSON<{
            data?: Player[];
            players?: Player[];
          }>(
            `${API}/api/team-players/${encodeURIComponent(
              opponent,
            )}`,
          ),
        ]);

      const loadedOurPlayers =
        Array.isArray(ourPlayers.data)
          ? ourPlayers.data
          : Array.isArray(ourPlayers.players)
            ? ourPlayers.players
            : [];

      const loadedOpponentPlayers =
        Array.isArray(opponentPlayers.data)
          ? opponentPlayers.data
          : Array.isArray(opponentPlayers.players)
            ? opponentPlayers.players
            : [];

      setBattleTeamPlayers(
        loadedOurPlayers,
      );

      setBattleOpponentPlayers(
        loadedOpponentPlayers,
      );

      setBatter((current) => {
        const exists =
          loadedOurPlayers.some(
            (player) =>
              player.player === current,
          );

        if (exists) {
          return current;
        }

        return loadedOurPlayers[0]?.player || "";
      });

      setBowler((current) => {
        const exists =
          loadedOpponentPlayers.some(
            (player) =>
              player.player === current,
          );

        if (exists) {
          return current;
        }

        return (
          loadedOpponentPlayers.find(
            (player) =>
              (safeNumber(player.bowlingBalls) ?? 0) > 0,
          )?.player || ""
        );
      });
    } catch (error) {
      console.error(error);
      setBattleTeamPlayers([]);
      setBattleOpponentPlayers([]);
      setBatter("");
      setBowler("");
    } finally {
      setBattlePlayersLoading(false);
    }
  }

  async function runCoachCalculation() {
    setCoach(null);

    setInferences((current) => {
      const next = {
        ...current,
      };

      delete next.coach;

      return next;
    });

    setLoading(true);
    setAnalysisStage("CALCULATING");

    try {
      const result =
        await getJSON<{
          data: CoachData;
        }>(
          `${API}/api/coach-recommendation?venue=${encodeURIComponent(
            selectedVenue,
          )}&team=${encodeURIComponent(
            selectedTeam,
          )}&opponent=${encodeURIComponent(
            selectedOpponent,
          )}`,
        );

      const record = result.data;

      setCoach(record);

      const fallback =
        inferCoach(record);

      const generated =
        await requestInference(
          "coach-calculation",
          record,
          fallback,
        );

      setInferences((current) => ({
        ...current,
        coach: generated,
      }));

      setAnalysisStage(
        "RESULT AVAILABLE",
      );
    } catch (error) {
      console.error(error);
      setAnalysisStage("ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function calculateTeam() {
    setLoading(true);
    setAnalysisStage("CALCULATING");
    setTeamAnalysisReady(false);

    try {
      const loadedTeams =
        await loadTeams();

      const team = loadedTeams.find(
        (item) =>
          item.team.toLowerCase() ===
          selectedTeam.toLowerCase(),
      );

      if (!team) {
        throw new Error(
          "Selected team was not found in team performance records.",
        );
      }

      setTeamAnalysisReady(true);

      const fallback =
        inferTeam(team);

      const generated =
        await requestInference(
          "team-analysis",
          team,
          fallback,
        );

      setInferences((current) => ({
        ...current,
        team: generated,
      }));

      setAnalysisStage(
        "RESULT AVAILABLE",
      );
    } catch (error) {
      console.error(error);
      setAnalysisStage("ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function calculateTeamPlayers() {
    setLoading(true);
    setAnalysisStage("CALCULATING");
    setDirectoryReady(false);
    setTeamPlayers([]);

    try {
      const players =
        await loadTeamPlayers(
          selectedTeam,
        );

      setDirectoryReady(true);

      const fallback =
        inferDirectory(players);

      const generated =
        await requestInference(
          "player-directory",
          {
            team: selectedTeam,
            players,
          },
          fallback,
        );

      setInferences((current) => ({
        ...current,
        directory: generated,
      }));

      setAnalysisStage(
        "RESULT AVAILABLE",
      );
    } catch (error) {
      console.error(error);
      setDirectoryReady(false);
      setAnalysisStage("ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function calculateH2H() {
    setLoading(true);
    setAnalysisStage("CALCULATING");
    setH2h(null);

    try {
      const result =
        await getJSON<{
          data: H2H;
        }>(
          `${API}/api/head-to-head?team=${encodeURIComponent(
            selectedTeam,
          )}&opponent=${encodeURIComponent(
            selectedOpponent,
          )}`,
        );

      const record = result.data;

      setH2h(record);

      const fallback =
        inferH2H(record);

      const generated =
        await requestInference(
          "head-to-head",
          record,
          fallback,
        );

      setInferences((current) => ({
        ...current,
        h2h: generated,
      }));

      setAnalysisStage(
        "RESULT AVAILABLE",
      );
    } catch (error) {
      console.error(error);
      setAnalysisStage("ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function calculateVenue() {
    if (!selectedVenue) {
      setAnalysisStage("ERROR");
      return;
    }

    setLoading(true);
    setAnalysisStage("CALCULATING");
    setVenueData(null);

    try {
      const result =
        await getJSON<{
          data: VenueData;
        }>(
          `${API}/api/venue-intelligence?venue=${encodeURIComponent(
            selectedVenue,
          )}`,
        );

      const record = result.data;

      setVenueData(record);

      const fallback =
        inferVenue(record);

      const generated =
        await requestInference(
          "venue-analysis",
          record,
          fallback,
        );

      setInferences((current) => ({
        ...current,
        venue: generated,
      }));

      setAnalysisStage(
        "RESULT AVAILABLE",
      );
    } catch (error) {
      console.error(error);
      setAnalysisStage("ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function calculateBattle() {
    const batterName = batter.trim();
    const bowlerName = bowler.trim();

    if (!batterName || !bowlerName) {
      setAnalysisStage("ERROR");
      return;
    }

    setLoading(true);
    setAnalysisStage("CALCULATING");
    setBattle(null);

    try {
      const result =
        await getJSON<{
          data: Battle;
        }>(
          `${API}/api/player-vs-player?batter=${encodeURIComponent(
            batterName,
          )}&bowler=${encodeURIComponent(
            bowlerName,
          )}`,
        );

      const record = result.data;

      setBattle(record);

      const fallback =
        inferBattle(record);

      const generated =
        await requestInference(
          "player-battle",
          {
            ...record,
            team: battleTeam,
            opponent: battleOpponent,
          },
          fallback,
        );

      setInferences((current) => ({
        ...current,
        battle: generated,
      }));

      setAnalysisStage(
        "RESULT AVAILABLE",
      );
    } catch (error) {
      console.error(error);
      setAnalysisStage("ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function searchPlayer() {
    const query =
      playerSearch.trim();

    if (!query) {
      return;
    }

    setPlayerSearchState(
      "PROCESSING",
    );

    setSelectedPlayer(null);

    try {
      const result =
        await getJSON<{
          data: Player;
        }>(
          `${API}/api/player/${encodeURIComponent(
            query,
          )}`,
        );

      const player = result.data;

      setSelectedPlayer(player);

      const fallback =
        inferPlayer(player);

      const generated =
        await requestInference(
          "player-analysis",
          player,
          fallback,
        );

      setInferences((current) => ({
        ...current,
        player: generated,
      }));

      setPlayerSearchState(
        "RESULT AVAILABLE",
      );
    } catch {
      const local =
        rankings.find(
          (player) =>
            player.player.toLowerCase() ===
            query.toLowerCase(),
        );

      if (local) {
        setSelectedPlayer(local);

        const fallback =
          inferPlayer(local);

        const generated =
          await requestInference(
            "player-analysis",
            local,
            fallback,
          );

        setInferences((current) => ({
          ...current,
          player: generated,
        }));

        setPlayerSearchState(
          "RESULT AVAILABLE",
        );
      } else {
        setPlayerSearchState("ERROR");
      }
    }
  }

  function handleTeamChange(
    team: string,
  ) {
    setSelectedTeam(team);

    setTeamPlayers([]);
    setDirectoryReady(false);
    setTeamAnalysisReady(false);

    setCoach(null);
    setH2h(null);

    setInferences((current) => {
      const next = {
        ...current,
      };

      delete next.directory;
      delete next.team;
      delete next.coach;
      delete next.h2h;

      return next;
    });

    if (selectedOpponent === team) {
      const nextOpponent =
        TEAMS.find(
          (item) => item !== team,
        ) || "";

      setSelectedOpponent(
        nextOpponent,
      );
    }
  }

  function handleOpponentChange(
    opponent: string,
  ) {
    setSelectedOpponent(opponent);

    setCoach(null);
    setH2h(null);

    setInferences((current) => {
      const next = {
        ...current,
      };

      delete next.coach;
      delete next.h2h;

      return next;
    });
  }

  function handleVenueChange(
    venue: string,
  ) {
    setSelectedVenue(venue);

    setCoach(null);
    setVenueData(null);

    setInferences((current) => {
      const next = {
        ...current,
      };

      delete next.coach;
      delete next.venue;

      return next;
    });
  }

  function handleBattleTeamChange(
    team: string,
  ) {
    setBattleTeam(team);

    setBattle(null);

    setInferences((current) => {
      const next = {
        ...current,
      };

      delete next.battle;

      return next;
    });

    if (battleOpponent === team) {
      const nextOpponent =
        TEAMS.find(
          (item) => item !== team,
        ) || "";

      setBattleOpponent(
        nextOpponent,
      );

      loadBattlePlayers(
        team,
        nextOpponent,
      );

      return;
    }

    loadBattlePlayers(
      team,
      battleOpponent,
    );
  }

  function handleBattleOpponentChange(
    opponent: string,
  ) {
    setBattleOpponent(opponent);

    setBattle(null);

    setInferences((current) => {
      const next = {
        ...current,
      };

      delete next.battle;

      return next;
    });

    loadBattlePlayers(
      battleTeam,
      opponent,
    );
  }

  if (showIntro) {
    return (
      <IntroAnimation
        onComplete={() =>
          setShowIntro(false)
        }
      />
    );
  }

  return (
    <div className="app">
      <div className="grid-bg" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Crosshair size={17} />
          </div>

          <div>
            <strong>
              STUMPS // COACH OS
            </strong>

            <span>
              IPL PERFORMANCE MANAGEMENT SYSTEM
            </span>
          </div>
        </div>

        <div className="system-status">
          <span className="status-pulse" />
          SYSTEM STATUS: OPERATIONAL
        </div>
      </header>

      <main className="system-shell">
        <nav className="tabs">
          {[
            {
              id: "calculator",
              label: "WORKSPACE",
              icon: Gauge,
            },
            {
              id: "players",
              label: "PLAYER ANALYSIS",
              icon: Users,
            },
            {
              id: "directory",
              label: "PLAYER DIRECTORY",
              icon: Database,
            },
            {
              id: "teams",
              label: "TEAM ANALYSIS",
              icon: Trophy,
            },
            {
              id: "h2h",
              label: "HEAD TO HEAD",
              icon: Swords,
            },
            {
              id: "venue",
              label: "VENUE ANALYSIS",
              icon: Radar,
            },
            {
              id: "battle",
              label: "PLAYER BATTLE",
              icon: Crosshair,
            },
            {
              id: "coach",
              label: "COACH CALCULATION",
              icon: BrainCircuit,
            },
          ].map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id
                  ? "active"
                  : ""
                  }`}
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section className="system-workspace">
          {activeTab === "calculator" && (
            <CalculationWorkspace
              dashboard={dashboard}
              teams={teams}
              onOpen={setActiveTab}
            />
          )}

          {activeTab === "players" && (
            <PlayerAnalysis
              rankings={rankings}
              playerSearch={playerSearch}
              setPlayerSearch={
                setPlayerSearch
              }
              searchPlayer={
                searchPlayer
              }
              playerSearchState={
                playerSearchState
              }
              selectedPlayer={
                selectedPlayer
              }
              inference={
                inferences.player
              }
            />
          )}

          {activeTab === "directory" && (
            <PlayerDirectory
              team={selectedTeam}
              setTeam={
                handleTeamChange
              }
              players={teamPlayers}
              ready={directoryReady}
              loading={loading}
              calculate={
                calculateTeamPlayers
              }
              inference={
                inferences.directory ||
                (directoryReady
                  ? inferDirectory(
                    teamPlayers,
                  )
                  : undefined)
              }
            />
          )}

          {activeTab === "teams" && (
            <TeamAnalysis
              teams={teams}
              selectedTeam={
                selectedTeam
              }
              setSelectedTeam={
                handleTeamChange
              }
              ready={
                teamAnalysisReady
              }
              loading={loading}
              calculate={
                calculateTeam
              }
              inference={
                inferences.team
              }
            />
          )}

          {activeTab === "h2h" && (
            <HeadToHead
              team={selectedTeam}
              opponent={
                selectedOpponent
              }
              setTeam={
                handleTeamChange
              }
              setOpponent={
                handleOpponentChange
              }
              h2h={h2h}
              loading={loading}
              calculate={
                calculateH2H
              }
              inference={
                inferences.h2h
              }
            />
          )}

          {activeTab === "venue" && (
            <VenueAnalysis
              venue={selectedVenue}
              setVenue={
                handleVenueChange
              }
              venueData={
                venueData
              }
              loading={loading}
              calculate={
                calculateVenue
              }
              inference={
                inferences.venue
              }
            />
          )}

          {activeTab === "battle" && (
            <PlayerBattle
              team={battleTeam}
              opponent={battleOpponent}
              batter={batter}
              bowler={bowler}
              teamPlayers={
                battleTeamPlayers
              }
              opponentPlayers={
                battleOpponentPlayers
              }
              setTeam={
                handleBattleTeamChange
              }
              setOpponent={
                handleBattleOpponentChange
              }
              setBatter={
                setBatter
              }
              setBowler={
                setBowler
              }
              battle={
                battle
              }
              loading={
                loading ||
                battlePlayersLoading
              }
              playersLoading={
                battlePlayersLoading
              }
              calculate={
                calculateBattle
              }
              inference={
                inferences.battle
              }
            />
          )}

          {activeTab === "coach" && (
            <CoachCalculation
              team={selectedTeam}
              opponent={
                selectedOpponent
              }
              venue={selectedVenue}
              setTeam={
                handleTeamChange
              }
              setOpponent={
                handleOpponentChange
              }
              setVenue={
                handleVenueChange
              }
              coach={coach}
              loading={loading}
              calculate={
                runCoachCalculation
              }
              inference={
                inferences.coach
              }
            />
          )}
        </section>
      </main>
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

function CalculationState({
  state,
}: {
  state: CalculationState;
}) {
  const className = state
    .toUpperCase()
    .replaceAll(" ", "_");

  return (
    <div
      className={`calculation-state ${className}`}
    >
      <span className="calculation-dot" />
      {state}
    </div>
  );
}

function PanelTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="panel-title">
      <div className="panel-title-icon">
        {icon}
      </div>

      <div>
        <h2>{title}</h2>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}

function InferenceBlock({
  inference,
}: {
  inference?: Inference;
}) {
  if (!inference) {
    return null;
  }

  return (
    <div className="inference-block">
      <div className="inference-heading">
        <strong>
          ANALYTICAL INFERENCE
        </strong>

        <span>
          {inference.source ||
            "Calculation output"}
        </span>
      </div>

      <div className="inference-row">
        <div className="inference-label">
          MEANING
        </div>

        <div className="inference-text">
          {inference.meaning}
        </div>
      </div>

      <div className="inference-row suggestion">
        <div className="inference-label">
          STAFF SUGGESTION
        </div>

        <div className="inference-text">
          {inference.suggestion}
        </div>
      </div>

      <div className="inference-row limit">
        <div className="inference-label">
          DATA LIMIT
        </div>

        <div className="inference-text">
          {inference.limitation}
        </div>
      </div>
    </div>
  );
}

function RecordCell({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="record-cell">
      <div className="record-cell-label">
        {label}
      </div>

      <div className="record-cell-value">
        {value}
      </div>
    </div>
  );
}

function EvidenceCell({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="evidence-cell">
      <div className="evidence-cell-label">
        {label}
      </div>

      <div className="evidence-cell-value">
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   VENUE CHOOSER
   ============================================================ */

function VenueChooser({
  venue,
  onSelect,
}: {
  venue: string;
  onSelect: (venue: string) => void;
}) {
  const [open, setOpen] =
    useState(false);

  function selectVenue(
    selected: string,
  ) {
    onSelect(selected);
    setOpen(false);
  }

  return (
    <>
      <div className="venue-selection">
        <button
          type="button"
          className="btn"
          onClick={() => setOpen(true)}
          aria-label="Open venue selector"
        >
          <Radar size={13} />
          SELECT VENUE
        </button>

        <div className="venue-selected">
          {venue || "NO VENUE SELECTED"}
        </div>
      </div>

      {open && (
        <div
          className="venue-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
            }
          }}
        >
          <div
            className="venue-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Venue selector"
          >
            <div className="venue-modal-header">
              <div>
                <strong>
                  VENUE SELECTOR
                </strong>

                <span>
                  Select the venue to use
                  in the historical
                  calculation.
                </span>
              </div>

              <button
                type="button"
                className="venue-modal-close"
                onClick={() =>
                  setOpen(false)
                }
                aria-label="Close venue selector"
              >
                ×
              </button>
            </div>

            <div className="venue-option-grid">
              {VENUES.map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    className={`venue-option ${venue === option
                      ? "selected"
                      : ""
                      }`}
                    onClick={() =>
                      selectVenue(
                        option,
                      )
                    }
                  >
                    {option}
                  </button>
                ),
              )}
            </div>

            <div className="venue-modal-footer">
              VENUE INPUT — CONTROLLED
              SELECTION. THE SELECTED
              VENUE IS PASSED DIRECTLY
              TO THE EXISTING BACKEND
              CALCULATION.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   WORKSPACE
   ============================================================ */

function CalculationWorkspace({
  dashboard,
  teams,
  onOpen,
}: {
  dashboard: DashboardData | null;
  teams: Team[];
  onOpen: (tab: string) => void;
}) {
  const modules = [
    {
      id: "01",
      tab: "players",
      title: "PLAYER ANALYSIS",
      description:
        "Historical player-level performance and role indicators.",
    },
    {
      id: "02",
      tab: "directory",
      title: "PLAYER DIRECTORY",
      description:
        "Team roster records and aggregate player contribution.",
    },
    {
      id: "03",
      tab: "teams",
      title: "TEAM ANALYSIS",
      description:
        "Historical team performance baseline.",
    },
    {
      id: "04",
      tab: "h2h",
      title: "HEAD TO HEAD",
      description:
        "Historical team-versus-team matchup record.",
    },
    {
      id: "05",
      tab: "venue",
      title: "VENUE ANALYSIS",
      description:
        "Venue-level historical performance evidence.",
    },
    {
      id: "06",
      tab: "battle",
      title: "PLAYER BATTLE",
      description:
        "Batter-versus-bowler historical matchup.",
    },
    {
      id: "07",
      tab: "coach",
      title: "COACH CALCULATION",
      description:
        "Combined team, opponent and venue decision calculation.",
    },
  ];

  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            CALCULATION WORKSPACE
          </h1>

          <p>
            Operational access to the IPL
            analytical modules. Calculations
            execute only when requested.
          </p>
        </div>

        <div className="system-clock">
          DATA SERVICE
        </div>
      </div>

      <div className="calculation-panel">
        <div className="calculation-header">
          <PanelTitle
            icon={<Activity size={15} />}
            title="SYSTEM REGISTER"
            subtitle="Current analytical service state"
          />

          <CalculationState
            state="READY"
          />
        </div>

        <div className="operation-grid">
          <div className="operation-item">
            <div className="operation-number">
              DATASET
            </div>

            <strong>
              {formatNumber(
                dashboard?.summary.matches,
                0,
              )}
            </strong>

            <span>
              matches indexed
            </span>
          </div>

          <div className="operation-item">
            <div className="operation-number">
              DELIVERIES
            </div>

            <strong>
              {formatNumber(
                dashboard?.summary
                  .deliveries,
                0,
              )}
            </strong>

            <span>
              deliveries available
            </span>
          </div>

          <div className="operation-item">
            <div className="operation-number">
              PLAYERS
            </div>

            <strong>
              {formatNumber(
                dashboard?.summary.players,
                0,
              )}
            </strong>

            <span>
              player records
            </span>
          </div>

          <div className="operation-item">
            <div className="operation-number">
              VENUES
            </div>

            <strong>
              {formatNumber(
                dashboard?.summary.venues,
                0,
              )}
            </strong>

            <span>
              venue records
            </span>
          </div>
        </div>
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={<Gauge size={15} />}
          title="CALCULATION MODULES"
          subtitle="Select an analytical operation"
        />

        <div className="workspace-list">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              className="workspace-row"
              onClick={() =>
                onOpen(module.tab)
              }
            >
              <span className="workspace-row-number">
                {module.id}
              </span>

              <span>
                <strong>
                  {module.title}
                </strong>

                <br />

                <span className="module-description">
                  {module.description}
                </span>
              </span>

              <span className="workspace-open">
                OPEN
                <ChevronRight
                  size={12}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="calculation-log">
        SERVICE STATE —{" "}
        {teams.length || 0} team records
        available. Calculations remain
        on-demand; no module executes on
        tab change.
      </div>
    </div>
  );
}

/* ============================================================
   PLAYER ANALYSIS
   ============================================================ */

function PlayerAnalysis({
  rankings,
  playerSearch,
  setPlayerSearch,
  searchPlayer,
  playerSearchState,
  selectedPlayer,
  inference,
}: {
  rankings: Player[];
  playerSearch: string;
  setPlayerSearch: (
    value: string,
  ) => void;
  searchPlayer: () => void;
  playerSearchState: CalculationState;
  selectedPlayer: Player | null;
  inference?: Inference;
}) {
  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            PLAYER ANALYSIS
          </h1>

          <p>
            Query a player and inspect the
            historical performance record
            returned by the analytical
            service.
          </p>
        </div>

        <CalculationState
          state={playerSearchState}
        />
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={<Users size={15} />}
          title="PLAYER QUERY"
          subtitle="Player-level historical calculation"
        />

        <div className="player-query-grid">
          <input
            value={playerSearch}
            onChange={(event) =>
              setPlayerSearch(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                searchPlayer();
              }
            }}
            placeholder="Enter player name"
          />

          <button
            type="button"
            className="btn"
            onClick={searchPlayer}
          >
            <Zap size={13} />
            RUN CALCULATION
          </button>
        </div>
      </div>

      {selectedPlayer && (
        <div className="calculation-panel">
          <div className="calculation-header">
            <PanelTitle
              icon={
                <BarChart3 size={15} />
              }
              title={
                selectedPlayer.player
              }
              subtitle="Historical player record"
            />

            <span className="pill">
              {formatNumber(
                selectedPlayer.matches,
                0,
              )}{" "}
              MATCHES
            </span>
          </div>

          <div className="record-grid">
            <RecordCell
              label="RUNS"
              value={formatNumber(
                selectedPlayer.runs,
                0,
              )}
            />

            <RecordCell
              label="BALLS"
              value={formatNumber(
                selectedPlayer.balls,
                0,
              )}
            />

            <RecordCell
              label="STRIKE RATE"
              value={formatNumber(
                selectedPlayer.strikeRate,
              )}
            />

            <RecordCell
              label="FOURS"
              value={formatNumber(
                selectedPlayer.fours,
                0,
              )}
            />

            <RecordCell
              label="SIXES"
              value={formatNumber(
                selectedPlayer.sixes,
                0,
              )}
            />

            <RecordCell
              label="WICKETS"
              value={formatNumber(
                selectedPlayer.wickets,
                0,
              )}
            />

            <RecordCell
              label="BOWLING BALLS"
              value={formatNumber(
                selectedPlayer.bowlingBalls,
                0,
              )}
            />

            <RecordCell
              label="ECONOMY"
              value={formatNumber(
                selectedPlayer.economy,
              )}
            />

            <RecordCell
              label="DISMISSALS"
              value={formatNumber(
                selectedPlayer.dismissals,
                0,
              )}
            />
          </div>

          <InferenceBlock
            inference={inference}
          />

          <div className="analysis-source">
            SOURCE — historical player
            performance calculation
          </div>
        </div>
      )}

      {!selectedPlayer && (
        <div className="calculation-panel">
          <PanelTitle
            icon={<History size={15} />}
            title="REFERENCE RECORDS"
            subtitle="Loaded player calculations"
          />

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PLAYER</th>
                  <th>RUNS</th>
                  <th>SR</th>
                  <th>WICKETS</th>
                </tr>
              </thead>

              <tbody>
                {rankings
                  .slice(0, 20)
                  .map((player) => (
                    <tr
                      key={player.player}
                    >
                      <td>
                        {player.player}
                      </td>

                      <td>
                        {formatNumber(
                          player.runs,
                          0,
                        )}
                      </td>

                      <td>
                        {formatNumber(
                          player.strikeRate,
                        )}
                      </td>

                      <td>
                        {formatNumber(
                          player.wickets,
                          0,
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PLAYER DIRECTORY
   ============================================================ */

function PlayerDirectory({
  team,
  setTeam,
  players,
  ready,
  loading,
  calculate,
  inference,
}: {
  team: string;
  setTeam: (value: string) => void;
  players: Player[];
  ready: boolean;
  loading: boolean;
  calculate: () => void;
  inference?: Inference;
}) {
  const [filter, setFilter] =
    useState("");

  const filteredPlayers =
    useMemo(() => {
      const query =
        filter.toLowerCase().trim();

      if (!query) {
        return players;
      }

      return players.filter(
        (player) =>
          player.player
            .toLowerCase()
            .includes(query),
      );
    }, [players, filter]);

  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            PLAYER DIRECTORY
          </h1>

          <p>
            Load a team's historical
            player records, then inspect
            the returned roster
            calculations.
          </p>
        </div>

        <CalculationState
          state={
            loading
              ? "PROCESSING"
              : ready
                ? "RESULT AVAILABLE"
                : "READY"
          }
        />
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={<Database size={15} />}
          title="TEAM QUERY"
          subtitle="Roster calculation input"
        />

        <div className="config-grid">
          <div className="config-field">
            <label>
              TEAM
            </label>

            <SelectBox
              value={team}
              onChange={setTeam}
              options={TEAMS}
            />
          </div>

          <button
            type="button"
            className="btn"
            onClick={calculate}
            disabled={loading}
          >
            <Zap size={13} />
            RUN CALCULATION
          </button>
        </div>
      </div>

      {ready && (
        <div className="calculation-panel">
          <div className="calculation-header">
            <PanelTitle
              icon={
                <Users size={15} />
              }
              title="ROSTER RECORDS"
              subtitle={`${players.length} returned player records`}
            />

            <input
              className="search-input"
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value,
                )
              }
              placeholder="Search loaded records"
            />
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PLAYER</th>
                  <th>RUNS</th>
                  <th>SR</th>
                  <th>WICKETS</th>
                  <th>ECONOMY</th>
                </tr>
              </thead>

              <tbody>
                {filteredPlayers.map(
                  (player) => (
                    <tr
                      key={player.player}
                    >
                      <td>
                        {player.player}
                      </td>

                      <td>
                        {formatNumber(
                          player.runs,
                          0,
                        )}
                      </td>

                      <td>
                        {formatNumber(
                          player.strikeRate,
                        )}
                      </td>

                      <td>
                        {formatNumber(
                          player.wickets,
                          0,
                        )}
                      </td>

                      <td>
                        {formatNumber(
                          player.economy,
                        )}
                      </td>
                    </tr>
                  ),
                )}

                {filteredPlayers.length ===
                  0 && (
                    <tr>
                      <td
                        colSpan={5}
                      >
                        NO MATCHING PLAYER
                        RECORDS
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          <InferenceBlock
            inference={inference}
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TEAM ANALYSIS
   ============================================================ */

function TeamAnalysis({
  teams,
  selectedTeam,
  setSelectedTeam,
  ready,
  loading,
  calculate,
  inference,
}: {
  teams: Team[];
  selectedTeam: string;
  setSelectedTeam: (
    value: string,
  ) => void;
  ready: boolean;
  loading: boolean;
  calculate: () => void;
  inference?: Inference;
}) {
  const team = teams.find(
    (item) =>
      item.team.toLowerCase() ===
      selectedTeam.toLowerCase(),
  );

  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            TEAM ANALYSIS
          </h1>

          <p>
            Calculate the historical
            performance baseline for a
            selected team.
          </p>
        </div>

        <CalculationState
          state={
            loading
              ? "PROCESSING"
              : ready
                ? "RESULT AVAILABLE"
                : "READY"
          }
        />
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={<Trophy size={15} />}
          title="TEAM QUERY"
          subtitle="Team-level calculation"
        />

        <div className="config-grid">
          <div className="config-field">
            <label>
              TEAM
            </label>

            <SelectBox
              value={selectedTeam}
              onChange={
                setSelectedTeam
              }
              options={TEAMS}
            />
          </div>

          <button
            type="button"
            className="btn"
            onClick={calculate}
            disabled={loading}
          >
            <Zap size={13} />
            RUN CALCULATION
          </button>
        </div>
      </div>

      {ready && team && (
        <div className="calculation-panel">
          <PanelTitle
            icon={
              <BarChart3 size={15} />
            }
            title="CALCULATED PERFORMANCE"
            subtitle={team.team}
          />

          <div className="record-grid">
            <RecordCell
              label="MATCHES"
              value={formatNumber(
                team.matches,
                0,
              )}
            />

            <RecordCell
              label="WINS"
              value={formatNumber(
                team.wins,
                0,
              )}
            />

            <RecordCell
              label="LOSSES"
              value={formatNumber(
                team.losses,
                0,
              )}
            />

            <RecordCell
              label="WIN RATE"
              value={percent(
                team.winPct,
              )}
            />
          </div>

          <InferenceBlock
            inference={
              inference ||
              inferTeam(team)
            }
          />
        </div>
      )}

      {ready && !team && (
        <div className="calculation-panel">
          <div className="warning-note">
            TEAM RECORD NOT FOUND IN THE
            RETURNED PERFORMANCE DATA.
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HEAD TO HEAD
   ============================================================ */

function HeadToHead({
  team,
  opponent,
  setTeam,
  setOpponent,
  h2h,
  loading,
  calculate,
  inference,
}: {
  team: string;
  opponent: string;
  setTeam: (value: string) => void;
  setOpponent: (
    value: string,
  ) => void;
  h2h: H2H | null;
  loading: boolean;
  calculate: () => void;
  inference?: Inference;
}) {
  const opponentOptions =
    TEAMS.filter(
      (item) => item !== team,
    );

  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            HEAD TO HEAD
          </h1>

          <p>
            Calculate the historical result
            record between two selected
            teams.
          </p>
        </div>

        <CalculationState
          state={
            loading
              ? "PROCESSING"
              : h2h
                ? "RESULT AVAILABLE"
                : "READY"
          }
        />
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={<Swords size={15} />}
          title="MATCHUP QUERY"
          subtitle="Two-team historical calculation"
        />

        <div className="config-grid">
          <div className="config-field">
            <label>
              TEAM
            </label>

            <SelectBox
              value={team}
              onChange={setTeam}
              options={TEAMS}
            />
          </div>

          <div className="config-field">
            <label>
              OPPONENT
            </label>

            <SelectBox
              value={opponent}
              onChange={
                setOpponent
              }
              options={
                opponentOptions
              }
            />
          </div>

          <button
            type="button"
            className="btn"
            onClick={calculate}
            disabled={loading}
          >
            <Zap size={13} />
            RUN CALCULATION
          </button>
        </div>
      </div>

      {h2h && (
        <div className="calculation-panel">
          <PanelTitle
            icon={<Swords size={15} />}
            title="MATCHUP RECORD"
            subtitle={`${h2h.team} vs ${h2h.opponent}`}
          />

          <div className="record-grid">
            <RecordCell
              label="MATCHES"
              value={formatNumber(
                h2h.matches,
                0,
              )}
            />

            <RecordCell
              label={`${h2h.team.toUpperCase()} WINS`}
              value={formatNumber(
                h2h.teamWins,
                0,
              )}
            />

            <RecordCell
              label={`${h2h.opponent.toUpperCase()} WINS`}
              value={formatNumber(
                h2h.opponentWins,
                0,
              )}
            />

            <RecordCell
              label="DRAWS / NR"
              value={formatNumber(
                h2h.draws,
                0,
              )}
            />
          </div>

          <InferenceBlock
            inference={
              inference ||
              inferH2H(h2h)
            }
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   VENUE ANALYSIS
   ============================================================ */

function VenueAnalysis({
  venue,
  setVenue,
  venueData,
  loading,
  calculate,
  inference,
}: {
  venue: string;
  setVenue: (value: string) => void;
  venueData: VenueData | null;
  loading: boolean;
  calculate: () => void;
  inference?: Inference;
}) {
  const venueTeams = venueData
    ? Object.entries(
      venueData.teams || {},
    ).sort(
      (a, b) =>
        (b[1].winPct || 0) -
        (a[1].winPct || 0),
    )
    : [];

  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            VENUE ANALYSIS
          </h1>

          <p>
            Calculate venue-level historical
            evidence from a controlled venue
            selection.
          </p>
        </div>

        <CalculationState
          state={
            loading
              ? "PROCESSING"
              : venueData
                ? "RESULT AVAILABLE"
                : "READY"
          }
        />
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={<Radar size={15} />}
          title="VENUE QUERY"
          subtitle="Historical venue calculation"
        />

        <VenueChooser
          venue={venue}
          onSelect={setVenue}
        />

        <div
          style={{
            marginTop: "12px",
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={calculate}
            disabled={loading}
          >
            <Zap size={13} />
            RUN CALCULATION
          </button>
        </div>
      </div>

      {venueData && (
        <div className="calculation-panel">
          <PanelTitle
            icon={<Radar size={15} />}
            title={venueData.venue}
            subtitle="Returned venue record"
          />

          <div className="record-grid">
            <RecordCell
              label="MATCHES"
              value={formatNumber(
                venueData.matches,
                0,
              )}
            />

            <RecordCell
              label="TEAMS"
              value={formatNumber(
                venueTeams.length,
                0,
              )}
            />

            <RecordCell
              label="DATA STATUS"
              value="AVAILABLE"
            />
          </div>

          <div className="player-subsection">
            <div className="player-subsection-title">
              TEAM VENUE RECORDS
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TEAM</th>
                    <th>MATCHES</th>
                    <th>WINS</th>
                    <th>WIN RATE</th>
                  </tr>
                </thead>

                <tbody>
                  {venueTeams.map(
                    ([team, record]) => (
                      <tr key={team}>
                        <td>
                          {team}
                        </td>

                        <td>
                          {formatNumber(
                            record.matches,
                            0,
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            record.wins,
                            0,
                          )}
                        </td>

                        <td>
                          {percent(
                            record.winPct,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <InferenceBlock
            inference={
              inference ||
              inferVenue(
                venueData,
              )
            }
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PLAYER BATTLE
   ============================================================ */

function PlayerBattle({
  team,
  opponent,
  batter,
  bowler,
  teamPlayers,
  opponentPlayers,
  setTeam,
  setOpponent,
  setBatter,
  setBowler,
  battle,
  loading,
  playersLoading,
  calculate,
  inference,
}: {
  team: string;
  opponent: string;
  batter: string;
  bowler: string;
  teamPlayers: Player[];
  opponentPlayers: Player[];
  setTeam: (value: string) => void;
  setOpponent: (value: string) => void;
  setBatter: (value: string) => void;
  setBowler: (value: string) => void;
  battle: Battle | null;
  loading: boolean;
  playersLoading: boolean;
  calculate: () => void;
  inference?: Inference;
}) {
  const opponentOptions =
    TEAMS.filter(
      (item) => item !== team,
    );

  const batterOptions =
    teamPlayers
      .map((player) => player.player)
      .filter(Boolean);

  const bowlerOptions =
    opponentPlayers
      .filter((player) => (safeNumber(player.bowlingBalls) ?? 0) > 0)
      .map((player) => player.player)
      .filter(Boolean);

  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            PLAYER BATTLE
          </h1>

          <p>
            Calculate a historical
            batter-versus-bowler matchup
            using players selected from
            the two team rosters.
          </p>
        </div>

        <CalculationState
          state={
            loading
              ? "PROCESSING"
              : battle
                ? "RESULT AVAILABLE"
                : "READY"
          }
        />
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={
            <Crosshair size={15} />
          }
          title="MATCHUP QUERY"
          subtitle="Team and player matchup calculation"
        />

        <div className="config-grid">
          <div className="config-field">
            <label>
              OUR TEAM
            </label>

            <SelectBox
              value={team}
              onChange={setTeam}
              options={TEAMS}
            />
          </div>

          <div className="config-field">
            <label>
              OPPONENT
            </label>

            <SelectBox
              value={opponent}
              onChange={
                setOpponent
              }
              options={
                opponentOptions
              }
            />
          </div>

          <div className="config-field">
            <label>
              BATTER
            </label>

            <SelectBox
              value={batter}
              onChange={setBatter}
              options={
                batterOptions
              }
            />
          </div>

          <div className="config-field">
            <label>
              BOWLER
            </label>

            <SelectBox
              value={bowler}
              onChange={setBowler}
              options={
                bowlerOptions
              }
            />
          </div>

          <button
            type="button"
            className="btn"
            onClick={calculate}
            disabled={
              loading ||
              playersLoading ||
              !batter ||
              !bowler
            }
          >
            <Zap size={13} />
            RUN CALCULATION
          </button>
        </div>

        {playersLoading && (
          <div className="calculation-log">
            ROSTER PIPELINE — loading
            historical player records for
            selected team and opponent.
          </div>
        )}

        {!playersLoading &&
          (!batterOptions.length ||
            !bowlerOptions.length) && (
            <div className="warning-note">
              PLAYER OPTIONS ARE NOT
              CURRENTLY LOADED FOR ONE OR
              BOTH SELECTED TEAMS.
            </div>
          )}
      </div>

      {battle && (
        <div className="calculation-panel">
          <PanelTitle
            icon={<Target size={15} />}
            title="BATTLE RECORD"
            subtitle={`${battle.batter} vs ${battle.bowler}`}
          />

          <div className="record-grid">
            <RecordCell
              label="OUR TEAM"
              value={team}
            />

            <RecordCell
              label="OPPONENT"
              value={opponent}
            />

            <RecordCell
              label="BALLS"
              value={formatNumber(
                battle.balls,
                0,
              )}
            />

            <RecordCell
              label="RUNS"
              value={formatNumber(
                battle.runs,
                0,
              )}
            />

            <RecordCell
              label="STRIKE RATE"
              value={formatNumber(
                battle.strikeRate,
              )}
            />

            <RecordCell
              label="DOT BALLS"
              value={formatNumber(
                battle.dots,
                0,
              )}
            />

            <RecordCell
              label="FOURS"
              value={formatNumber(
                battle.fours,
                0,
              )}
            />

            <RecordCell
              label="SIXES"
              value={formatNumber(
                battle.sixes,
                0,
              )}
            />

            <RecordCell
              label="WICKETS"
              value={formatNumber(
                battle.wickets,
                0,
              )}
            />
          </div>

          {(battle.balls || 0) <
            30 && (
              <div className="warning-note">
                SMALL SAMPLE — this matchup
                should not be treated as a
                stable player tendency.
              </div>
            )}

          <InferenceBlock
            inference={
              inference ||
              inferBattle(battle)
            }
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COACH CALCULATION
   ============================================================ */

function CoachCalculation({
  team,
  opponent,
  venue,
  setTeam,
  setOpponent,
  setVenue,
  coach,
  loading,
  calculate,
  inference,
}: {
  team: string;
  opponent: string;
  venue: string;
  setTeam: (value: string) => void;
  setOpponent: (
    value: string,
  ) => void;
  setVenue: (value: string) => void;
  coach: CoachData | null;
  loading: boolean;
  calculate: () => void;
  inference?: Inference;
}) {
  const opponentOptions =
    TEAMS.filter(
      (item) => item !== team,
    );

  return (
    <div>
      <div className="system-heading">
        <div className="system-heading-copy">
          <h1>
            COACH CALCULATION
          </h1>

          <p>
            Combined historical calculation
            using team, opponent and venue
            evidence. The backend remains
            responsible for the actual
            decision score.
          </p>
        </div>

        <CalculationState
          state={
            loading
              ? "PROCESSING"
              : coach
                ? "RESULT AVAILABLE"
                : "READY"
          }
        />
      </div>

      <div className="calculation-panel">
        <PanelTitle
          icon={
            <BrainCircuit size={15} />
          }
          title="MATCH SCENARIO"
          subtitle="Calculation inputs"
        />

        <div className="config-grid">
          <div className="config-field">
            <label>
              TEAM
            </label>

            <SelectBox
              value={team}
              onChange={setTeam}
              options={TEAMS}
            />
          </div>

          <div className="config-field">
            <label>
              OPPONENT
            </label>

            <SelectBox
              value={opponent}
              onChange={
                setOpponent
              }
              options={
                opponentOptions
              }
            />
          </div>
        </div>

        <div className="config-field">
          <label>
            VENUE
          </label>

          <VenueChooser
            venue={venue}
            onSelect={setVenue}
          />
        </div>

        <div
          style={{
            marginTop: "14px",
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={calculate}
            disabled={
              loading ||
              !team ||
              !opponent ||
              !venue
            }
          >
            <Zap size={13} />
            RUN CALCULATION
          </button>
        </div>

        {loading && (
          <div className="calculation-log">
            CALCULATION PIPELINE —
            retrieving venue, team and
            opponent evidence → resolving
            backend decision → generating
            interpretation
          </div>
        )}
      </div>

      {coach && (
        <CoachResult
          coach={coach}
          inference={
            inference ||
            inferCoach(coach)
          }
        />
      )}
    </div>
  );
}

/* ============================================================
   COACH RESULT
   ============================================================ */

function CoachResult({
  coach,
  inference,
}: {
  coach: CoachData;
  inference: Inference;
}) {
  const strategyBonus =
    safeNumber(
      coach.strategyBonus,
    ) ?? 0;

  const tossBonus =
    safeNumber(
      coach.tossBonus,
    ) ?? 0;

  const performance =
    safeNumber(
      coach.performanceScore,
    ) ?? 0;

  const finalScore =
    safeNumber(
      coach.finalScore,
    ) ??
    performance +
    strategyBonus +
    tossBonus;

  return (
    <div className="calculation-panel">
      <div className="coach-result-header">
        <div className="decision-box">
          <small>
            BACKEND DECISION
          </small>

          <strong>
            {coach.finalDecision ||
              "—"}
          </strong>

          <div className="system-note">
            {coach.team} VS{" "}
            {coach.opponent}
            <br />
            {coach.venue}
          </div>
        </div>

        <div className="score-box">
          <small>
            FINAL SCORE
          </small>

          <strong>
            {formatNumber(
              finalScore,
            )}
          </strong>
        </div>
      </div>

      <div className="player-subsection">
        <div className="player-subsection-title">
          PERFORMANCE EVIDENCE
        </div>

        <div className="evidence-grid">
          <EvidenceCell
            label="MATCHES"
            value={formatNumber(
              coach.matches,
              0,
            )}
          />

          <EvidenceCell
            label="WINS"
            value={formatNumber(
              coach.wins,
              0,
            )}
          />

          <EvidenceCell
            label="LOSSES"
            value={formatNumber(
              coach.losses,
              0,
            )}
          />

          <EvidenceCell
            label="OVERALL WIN %"
            value={percent(
              coach.overallWinPct,
            )}
          />

          <EvidenceCell
            label="VENUE WIN %"
            value={percent(
              coach.venueWinPct,
            )}
          />

          <EvidenceCell
            label="PERFORMANCE"
            value={formatNumber(
              coach.performanceScore,
            )}
          />

          <EvidenceCell
            label="CONFIDENCE"
            value={
              coach.overallConfidence ||
              "—"
            }
          />

          <EvidenceCell
            label="VENUE CONFIDENCE"
            value={
              coach.venueConfidence ||
              "—"
            }
          />
        </div>
      </div>

      <div className="player-subsection">
        <div className="player-subsection-title">
          STRATEGY EVIDENCE
        </div>

        <div className="evidence-grid">
          <EvidenceCell
            label="BAT FIRST"
            value={formatNumber(
              coach.batFirst,
              0,
            )}
          />

          <EvidenceCell
            label="BAT FIRST WIN %"
            value={percent(
              coach.batFirstWinPct,
            )}
          />

          <EvidenceCell
            label="FIELD FIRST"
            value={formatNumber(
              coach.fieldFirst,
              0,
            )}
          />

          <EvidenceCell
            label="FIELD FIRST WIN %"
            value={percent(
              coach.fieldFirstWinPct,
            )}
          />

          <EvidenceCell
            label="SIGNAL"
            value={
              coach.strategySignal ||
              "NONE"
            }
          />

          <EvidenceCell
            label="MODIFIER"
            value={
              strategyBonus >= 0
                ? `+${formatNumber(
                  strategyBonus,
                )}`
                : formatNumber(
                  strategyBonus,
                )
            }
          />
        </div>
      </div>

      <div className="player-subsection">
        <div className="player-subsection-title">
          TOSS EVIDENCE
        </div>

        <div className="evidence-grid">
          <EvidenceCell
            label="TOSS WINS"
            value={formatNumber(
              coach.tossWins,
              0,
            )}
          />

          <EvidenceCell
            label="TOSS LOSSES"
            value={formatNumber(
              coach.tossLosses,
              0,
            )}
          />

          <EvidenceCell
            label="CONVERSION"
            value={percent(
              coach.tossConversionPct,
            )}
          />

          <EvidenceCell
            label="SIGNAL"
            value={
              coach.tossSignal ||
              "NONE"
            }
          />

          <EvidenceCell
            label="MODIFIER"
            value={
              tossBonus >= 0
                ? `+${formatNumber(
                  tossBonus,
                )}`
                : formatNumber(
                  tossBonus,
                )
            }
          />
        </div>
      </div>

      <div className="player-subsection">
        <div className="player-subsection-title">
          CALCULATION TRACE
        </div>

        <div className="trace-line">
          <span className="trace-item">
            PERFORMANCE{" "}
            {formatNumber(
              performance,
            )}
          </span>

          <span className="trace-arrow">
            +
          </span>

          <span className="trace-item">
            STRATEGY{" "}
            {strategyBonus >= 0
              ? "+"
              : ""}
            {formatNumber(
              strategyBonus,
            )}
          </span>

          <span className="trace-arrow">
            +
          </span>

          <span className="trace-item">
            TOSS{" "}
            {tossBonus >= 0
              ? "+"
              : ""}
            {formatNumber(
              tossBonus,
            )}
          </span>

          <span className="trace-arrow">
            =
          </span>

          <span className="trace-item">
            FINAL{" "}
            {formatNumber(
              finalScore,
            )}
          </span>
        </div>
      </div>

      {coach.recommendation && (
        <div className="system-note">
          <strong>
            BACKEND RECOMMENDATION
          </strong>

          <br />

          {coach.recommendation}
        </div>
      )}

      <InferenceBlock
        inference={inference}
      />

      <div className="analysis-source">
        SOURCE — backend coach decision
        engine; interpretation layer is
        separate from the underlying
        calculation.
      </div>
    </div>
  );
}