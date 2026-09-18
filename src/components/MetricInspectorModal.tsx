import React from 'react';
import type { MetricExplanation } from '../types/coach';

interface Props {
  data: MetricExplanation | null;
  onClose: () => void;
}

export const MetricInspectorModal: React.FC<Props> = ({
  data,
  onClose
}) => {
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">
              Metric Inspector
            </div>

            <h2 className="text-xl font-black text-white mt-1">
              {data.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">

          {/* Raw metric */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Raw Metric
            </div>

            <div className="mt-1 font-mono text-cyan-300 text-sm">
              {data.rawMetric}
            </div>
          </div>

          {/* Value */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Recorded Value
            </div>

            <div className="mt-1 text-2xl font-black text-white font-mono">
              {data.value}
            </div>
          </div>

          {/* Cricket meaning */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-400">
              Cricket Meaning
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {data.cricketMeaning}
            </p>
          </div>

          {/* Tactical impact */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20">
            <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
              Tactical Impact
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {data.tacticalImpact}
            </p>
          </div>

          {/* Confidence warning */}
          {data.confidenceWarning && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40">
              <div className="text-[10px] uppercase tracking-wider font-bold text-rose-400">
                Confidence Warning
              </div>

              <p className="mt-2 text-sm leading-relaxed text-rose-200">
                {data.confidenceWarning}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-cyan-400 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricInspectorModal;