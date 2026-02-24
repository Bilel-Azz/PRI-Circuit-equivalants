'use client';

import { useState } from 'react';
import { Candidate, Impedance } from '@/lib/api';
import ImpedanceChart from './ImpedanceChart';
import CircuitDisplay from './CircuitDisplay';

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
  targetImpedance?: Impedance;
}

export default function CandidateCard({ candidate, rank, targetImpedance }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const magErr = candidate.error.magnitude.toFixed(3);
  const phaseErr = (candidate.error.phase * 180 / Math.PI).toFixed(1);

  return (
    <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-50/80 transition-colors text-left"
      >
        <span className="text-xs font-semibold text-zinc-400 w-6 text-center">#{rank}</span>

        <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
          {candidate.components.map((c, i) => (
            <span key={i} className={`chip-${c.type.toLowerCase()} text-[10px]`}>
              {c.type}={c.formatted_value}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">Mag</span>
            <span className="text-xs font-mono font-medium">{magErr}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">Phase</span>
            <span className="text-xs font-mono font-medium">{phaseErr}&deg;</span>
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-[hsl(var(--border))] p-4 space-y-4 bg-zinc-50/30">
          <ImpedanceChart
            target={targetImpedance}
            predicted={candidate.impedance}
            compact
          />

          <CircuitDisplay components={candidate.components} compact />
        </div>
      )}
    </div>
  );
}
