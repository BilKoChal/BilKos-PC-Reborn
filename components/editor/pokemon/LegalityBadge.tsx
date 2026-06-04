import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Shield } from 'lucide-react';
import { LegalityAnalysis } from '../../../lib/legality';
import { analysisTone, analysisHeadline, notableResults, LegalityTone } from '../../../lib/legality';

interface LegalityBadgeProps {
  analysis: LegalityAnalysis | null;
}

const TONE_STYLES: Record<LegalityTone, string> = {
  valid: 'bg-emerald-500/20 text-emerald-50 border-emerald-300/30 hover:bg-emerald-500/30',
  warn: 'bg-amber-500/25 text-amber-50 border-amber-300/30 hover:bg-amber-500/35',
  error: 'bg-red-500/25 text-red-50 border-red-300/30 hover:bg-red-500/35',
  unknown: 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20',
};

function ToneIcon({ tone }: { tone: LegalityTone }) {
  if (tone === 'valid') return <ShieldCheck size={16} />;
  if (tone === 'warn') return <ShieldAlert size={16} />;
  if (tone === 'error') return <ShieldX size={16} />;
  return <Shield size={16} />;
}

/**
 * Non-blocking structural-legality advisory for the Pokémon being edited.
 * Shows a tone-coloured pill; clicking reveals the individual findings. It is
 * deliberately advisory — the popover footer states that only structural checks
 * ran, so it never implies a full legality guarantee.
 */
export const LegalityBadge: React.FC<LegalityBadgeProps> = ({ analysis }) => {
  const [open, setOpen] = useState(false);
  const tone = analysisTone(analysis);
  const headline = analysisHeadline(analysis);
  const issues = notableResults(analysis);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Legality: ${headline}`}
        aria-expanded={open}
        title={analysis?.summary ?? 'Legality not analyzed'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm transition-colors ${TONE_STYLES[tone]}`}
      >
        <ToneIcon tone={tone} />
        <span className="hidden sm:inline whitespace-nowrap">{headline}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 text-left rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Legality</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close legality details"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
            >
              ✕
            </button>
          </div>

          <div className="p-3 space-y-2">
            {issues.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                No structural problems found.
              </p>
            ) : (
              issues.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={r.severity === 'Invalid' ? 'text-red-500 mt-0.5' : 'text-amber-500 mt-0.5'}>
                    {r.severity === 'Invalid' ? <ShieldX size={13} /> : <ShieldAlert size={13} />}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{r.category}:</span> {r.comment}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Structural checks only (stat ranges, EV total, level, species, moves). No
              encounter/move-learnability analysis yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
