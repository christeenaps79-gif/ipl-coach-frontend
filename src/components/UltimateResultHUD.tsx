import React, { useEffect, useState } from 'react';
import type  {
  CoachRecommendationRecord,
  DecisionType
} from '../types/coach';

interface Props {
  record: CoachRecommendationRecord;
}

const DECISION_PALETTE: Record<
  DecisionType,
  {
    title: string;
    color: string;
    border: string;
    glow: string;
    badge: string;
  }
> = {
  STRONG_POSITIVE: {
    title: 'CRUSHING TACTICAL ADVANTAGE',
    color: 'text-emerald-400',
    border: 'border-emerald-500',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.35)]',
    badge:
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
  },

  POSITIVE: {
    title: 'FAVORABLE MATCHUP BIAS',
    color: 'text-cyan-400',
    border: 'border-cyan-500',
    glow: 'shadow-[0_0_40px_rgba(6,182,212,0.35)]',
    badge:
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
  },

  BALANCED: {
    title: 'NEUTRAL / BALANCED ENGAGEMENT',
    color: 'text-amber-400',
    border: 'border-amber-500',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.35)]',
    badge:
      'bg-amber-500/20 text-amber-300 border-amber-500/50'
  },

  NEGATIVE: {
    title: 'RESISTANCE / ADVERSE CONDITIONS',
    color: 'text-orange-500',
    border: 'border-orange-500',
    glow: 'shadow-[0_0_40px_rgba(249,115,22,0.35)]',
    badge:
      'bg-orange-500/20 text-orange-300 border-orange-500/50'
  },

  STRONG_NEGATIVE: {
    title: 'CRITICAL DEFICIT / HEAVY UNDERDOG',
    color: 'text-rose-500',
    border: 'border-rose-500',
    glow: 'shadow-[0_0_40px_rgba(244,63,94,0.35)]',
    badge:
      'bg-rose-500/20 text-rose-300 border-rose-500/50'
  }
};

export const UltimateResultHUD: React.FC<Props> = ({ record }) => {
  const [messages, setMessages] = useState<string[]>([]);

  const config = DECISION_PALETTE[record.finalDecision];

  useEffect(() => {
    setMessages([]);

    const sequence = [
      `[NODE 01] Venue baseline isolated: ${record.venueWinPct}% across registered games.`,

      `[NODE 02] Head-to-Head overall calculated at ${record.overallWinPct}%.`,

      `[NODE 03] Strategy modifier applied: ${
        record.strategyBonus > 0 ? '+' : ''
      }${record.strategyBonus.toFixed(2)} pts (${record.strategySignal}).`,

      `[NODE 04] Toss conversion impact evaluated: ${record.tossConversionPct}% (${record.tossSignal}).`,

      `[FINAL RESOLUTION] Final Score ${record.finalScore.toFixed(
        2
      )} mapped to ${record.finalDecision}.`
    ];

    const timers = sequence.map((msg, idx) =>
      setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
      }, (idx + 1) * 350)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [record]);

  return (
    <div
      className={`relative p-6 sm:p-8 rounded-2xl bg-slate-900/90 border ${config.border} ${config.glow} backdrop-blur-xl transition-all duration-700`}
    >
      {/* Scanning beam */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />

            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              ULTIMATE TACTICAL DIRECTIVE
            </span>
          </div>

          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-1 ${config.color}`}
          >
            {config.title}
          </h1>

          <div className="text-xs text-slate-400 mt-2 font-mono">
            TARGET:{' '}
            <span className="text-white font-bold">
              {record.team}
            </span>{' '}
            vs{' '}
            <span className="text-white font-bold">
              {record.opponent}
            </span>{' '}
            at{' '}
            <span className="text-cyan-300">
              {record.venue}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-xs text-slate-400 font-mono">
              FINAL SCORE:
            </span>

            <span className="text-4xl font-black text-white font-mono">
              {record.finalScore.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span
              className={`px-3 py-1 text-xs font-bold rounded border ${config.badge}`}
            >
              CONFIDENCE: {record.decisionConfidence}
            </span>

            <span className="px-3 py-1 text-xs font-bold rounded border border-slate-700 bg-slate-800/80 text-slate-300">
              VENUE SAMPLE: {record.venueConfidence}
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry */}
      <div className="mt-6">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
          DECISION TELEMETRY STREAM
        </div>

        <div className="space-y-1.5 font-mono text-xs max-h-40 overflow-y-auto">
          {messages.map((text, i) => (
            <div
              key={i}
              className="p-2 rounded bg-slate-950/60 border-l-2 border-cyan-400 text-cyan-200/90"
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">
            Performance Baseline
          </div>

          <div className="text-xl font-black text-white mt-0.5">
            {record.performanceScore.toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">
            Strategy Bonus
          </div>

          <div className="text-xl font-black text-emerald-400 mt-0.5">
            +{record.strategyBonus.toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">
            Toss Bonus
          </div>

          <div className="text-xl font-black text-cyan-400 mt-0.5">
            +{record.tossBonus.toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">
            Total Recorded Matches
          </div>

          <div className="text-xl font-black text-amber-400 mt-0.5">
            {record.matches}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateResultHUD;