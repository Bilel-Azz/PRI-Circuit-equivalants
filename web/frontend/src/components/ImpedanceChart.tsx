'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Impedance } from '@/lib/api';

interface ImpedanceChartProps {
  target?: Impedance;
  predicted?: Impedance;
  compact?: boolean;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-lg text-xs">
        <p className="font-semibold text-gray-900 mb-1">{Number(label).toFixed(1)} Hz</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500">{entry.name}:</span>
            <span className="font-mono font-medium">{entry.value.toFixed(3)} {unit}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function computeMatchScore(target: Impedance, predicted: Impedance): number | null {
  if (target.magnitude.length !== predicted.magnitude.length) return null;
  const n = target.magnitude.length;
  let magError = 0, phaseError = 0, derivError = 0;
  for (let i = 0; i < n; i++) {
    magError += Math.pow(target.magnitude[i] - predicted.magnitude[i], 2);
    phaseError += Math.pow(target.phase[i] - predicted.phase[i], 2);
  }
  for (let i = 0; i < n - 1; i++) {
    const dT = target.magnitude[i + 1] - target.magnitude[i];
    const dP = predicted.magnitude[i + 1] - predicted.magnitude[i];
    derivError += Math.pow(dT - dP, 2);
  }
  const magRMSE = Math.sqrt(magError / n);
  const phaseRMSE = Math.sqrt(phaseError / n);
  const derivRMSE = Math.sqrt(derivError / (n - 1));
  const magScore = Math.max(0, 100 * (1 - magRMSE / 2));
  const derivScore = Math.max(0, 100 * (1 - derivRMSE / 0.5));
  const phaseScore = Math.max(0, 100 * (1 - phaseRMSE / 1));
  return Math.round(0.4 * magScore + 0.35 * derivScore + 0.25 * phaseScore);
}

export default function ImpedanceChart({ target, predicted, compact }: ImpedanceChartProps) {
  if (!target && !predicted) {
    return (
      <div className="flex items-center justify-center h-48 text-[hsl(var(--muted-foreground))] text-sm">
        No impedance data
      </div>
    );
  }

  const frequencies = target?.frequencies || predicted?.frequencies || [];
  const matchScore = target && predicted ? computeMatchScore(target, predicted) : null;

  const magnitudeData = frequencies.map((freq, i) => ({
    frequency: freq,
    target: target?.magnitude[i],
    predicted: predicted?.magnitude[i],
  }));

  const phaseData = frequencies.map((freq, i) => ({
    frequency: freq,
    target: target ? target.phase[i] * 180 / Math.PI : undefined,
    predicted: predicted ? predicted.phase[i] * 180 / Math.PI : undefined,
  }));

  const chartHeight = compact ? 180 : 260;

  return (
    <div className="space-y-4">
      {/* Match score badge */}
      {matchScore !== null && (
        <div className="flex items-center justify-end">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            matchScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            matchScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              matchScore >= 80 ? 'bg-emerald-500' :
              matchScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            Match {matchScore}%
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Magnitude */}
        <div className="bg-zinc-50/50 p-4 rounded-lg border border-zinc-100">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">Magnitude (log10|Z|)</h4>
          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer>
              <LineChart data={magnitudeData} margin={{ top: 4, right: 16, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="frequency" scale="log" domain={['dataMin', 'dataMax']}
                  tickFormatter={(v) => v >= 1e6 ? `${+(v / 1e6).toPrecision(3)}M` : v >= 1e3 ? `${+(v / 1e3).toPrecision(3)}k` : v.toFixed(0)}
                  tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip unit="" />} />
                {target && (
                  <Line type="linear" dataKey="target" stroke="#18181b" strokeWidth={2} dot={false} name="Target"
                    activeDot={{ r: 3, strokeWidth: 0 }} />
                )}
                {predicted && (
                  <Line type="linear" dataKey="predicted" stroke="#f97316" strokeWidth={2}
                    strokeDasharray="6 3" dot={false} name="Generated"
                    activeDot={{ r: 3, strokeWidth: 0 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase */}
        <div className="bg-zinc-50/50 p-4 rounded-lg border border-zinc-100">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">Phase (degrees)</h4>
          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer>
              <LineChart data={phaseData} margin={{ top: 4, right: 16, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="frequency" scale="log" domain={['dataMin', 'dataMax']}
                  tickFormatter={(v) => v >= 1e6 ? `${+(v / 1e6).toPrecision(3)}M` : v >= 1e3 ? `${+(v / 1e3).toPrecision(3)}k` : v.toFixed(0)}
                  tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis domain={[-90, 90]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip unit="°" />} />
                {target && (
                  <Line type="linear" dataKey="target" stroke="#18181b" strokeWidth={2} dot={false} name="Target"
                    activeDot={{ r: 3, strokeWidth: 0 }} />
                )}
                {predicted && (
                  <Line type="linear" dataKey="predicted" stroke="#f97316" strokeWidth={2}
                    strokeDasharray="6 3" dot={false} name="Generated"
                    activeDot={{ r: 3, strokeWidth: 0 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend */}
      {target && predicted && (
        <div className="flex items-center justify-center gap-6 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-zinc-800 rounded" />
            <span>Target (input)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f97316 0, #f97316 4px, transparent 4px, transparent 7px)' }} />
            <span>Generated circuit</span>
          </div>
        </div>
      )}
    </div>
  );
}
