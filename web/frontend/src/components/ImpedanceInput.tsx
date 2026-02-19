'use client';

import { useState, useEffect } from 'react';
import { Config, getConfig } from '@/lib/api';

interface ImpedanceInputProps {
  onSubmit: (magnitude: number[], phase: number[]) => void;
  loading?: boolean;
}

const SAMPLE_CURVES = [
  {
    name: 'RLC Serie Resonant',
    desc: 'R=100Ω + L=1mH + C=100nF',
    generate: (freqs: number[]) => {
      const R = 100, L = 1e-3, C = 100e-9;
      return freqs.map((f) => {
        const w = 2 * Math.PI * f;
        const Zr = R, Zi = w * L - 1 / (w * C);
        return { magnitude: Math.log10(Math.sqrt(Zr * Zr + Zi * Zi)), phase: Math.atan2(Zi, Zr) };
      });
    },
  },
  {
    name: 'Tank LC Anti-Resonant',
    desc: 'R=50Ω + (L=10mH ∥ C=1µF)',
    generate: (freqs: number[]) => {
      const Rs = 50, Rp = 10, L = 10e-3, C = 1e-6;
      return freqs.map((f) => {
        const w = 2 * Math.PI * f;
        const Zl = w * L, Zl2 = Rp * Rp + Zl * Zl;
        const Yr = Rp / Zl2, Yi = -Zl / Zl2 + w * C;
        const Ym = Yr * Yr + Yi * Yi;
        const Zr = Rs + Yr / Ym, Zi = -Yi / Ym;
        return { magnitude: Math.log10(Math.sqrt(Zr * Zr + Zi * Zi)), phase: Math.atan2(Zi, Zr) };
      });
    },
  },
  {
    name: 'RLC + RL Parallèle',
    desc: 'R=50Ω + L=10mH + C=1µF + RL shunt',
    generate: (freqs: number[]) => {
      const Rs = 50, L1 = 10e-3, C1 = 1e-6, R2 = 200, L2 = 5e-3;
      return freqs.map((f) => {
        const w = 2 * Math.PI * f;
        const Zsr = Rs, Zsi = w * L1 - 1 / (w * C1);
        const Yr = 1 / R2, Yi = -1 / (w * L2);
        const Ym = Yr * Yr + Yi * Yi;
        const Zpr = Yr / Ym, Zpi = -Yi / Ym;
        const Zr = Zsr + Zpr, Zi = Zsi + Zpi;
        return { magnitude: Math.log10(Math.sqrt(Zr * Zr + Zi * Zi)), phase: Math.atan2(Zi, Zr) };
      });
    },
  },
  {
    name: 'Double Resonance',
    desc: '2 branches LC asymétriques (3 features visibles)',
    generate: (freqs: number[]) => {
      // Asymmetric double resonance: R + (branch1 || branch2)
      // Branch 1: L1+C1 series (broad, f1~390Hz, Q~4)
      // Branch 2: L2+C2 series (narrow, f2~50kHz, Q~18)
      const R = 4.5, L1 = 1.707e-3, C1 = 9.706e-5, L2 = 5.613e-5, C2 = 1.792e-7;
      return freqs.map((f) => {
        const w = 2 * Math.PI * f;
        // Branch impedances (series LC each)
        const Z1r = 0, Z1i = w * L1 - 1 / (w * C1);
        const Z2r = 0, Z2i = w * L2 - 1 / (w * C2);
        // Parallel combination: Zp = Z1*Z2 / (Z1+Z2) (both purely imaginary)
        const sumI = Z1i + Z2i;
        const prodI = Z1i * Z2i;
        // Zp = (j*Z1i * j*Z2i) / (j*(Z1i+Z2i)) = j * (-Z1i*Z2i) / (Z1i+Z2i) = -prodI/sumI (imaginary)
        const ZpI = -prodI / sumI;
        const Zr = R, Zi = ZpI;
        return { magnitude: Math.log10(Math.sqrt(Zr * Zr + Zi * Zi)), phase: Math.atan2(Zi, Zr) };
      });
    },
  },
  {
    name: 'Ladder RLC 3 stages',
    desc: 'R-L-C-R-L-C',
    generate: (freqs: number[]) => {
      const R1 = 100, R2 = 200, L1 = 1e-3, L2 = 2e-3, C1 = 100e-9, C2 = 220e-9;
      return freqs.map((f) => {
        const w = 2 * Math.PI * f;
        const Z2r = R2, Z2i = w * L2 - 1 / (w * C2);
        const Z2m = Z2r * Z2r + Z2i * Z2i;
        const Ypr = Z2r / Z2m, Ypi = -Z2i / Z2m + w * C1;
        const Ypm = Ypr * Ypr + Ypi * Ypi;
        const Zr = R1 + Ypr / Ypm, Zi = w * L1 - Ypi / Ypm;
        return { magnitude: Math.log10(Math.sqrt(Zr * Zr + Zi * Zi)), phase: Math.atan2(Zi, Zr) };
      });
    },
  },
  {
    name: 'Notch Filter',
    desc: 'R + LC parallele (5kHz)',
    generate: (freqs: number[]) => {
      const Rs = 100, L = 10e-3, C = 100e-9;
      return freqs.map((f) => {
        const w = 2 * Math.PI * f;
        const Yi = -1 / (w * L) + w * C;
        const Ym = Math.abs(Yi);
        const Zp = Ym > 1e-10 ? 1 / Ym : 1e10;
        const Zpp = Yi > 0 ? -Math.PI / 2 : Math.PI / 2;
        const Zr = Rs + Zp * Math.cos(Zpp), Zi = Zp * Math.sin(Zpp);
        return { magnitude: Math.log10(Math.sqrt(Zr * Zr + Zi * Zi)), phase: Math.atan2(Zi, Zr) };
      });
    },
  },
  {
    name: 'Circuit 5 Components',
    desc: 'R1-L1-C1 + R2∥C2 shunt',
    generate: (freqs: number[]) => {
      const R1 = 150, R2 = 1000, L1 = 3e-3, C1 = 150e-9, C2 = 470e-9;
      return freqs.map((f) => {
        const w = 2 * Math.PI * f;
        const Yr2 = 1 / R2, Yc2 = w * C2;
        const Ym = Yr2 * Yr2 + Yc2 * Yc2;
        const Zsr = Yr2 / Ym, Zsi = -Yc2 / Ym;
        const Zr = R1 + Zsr, Zi = w * L1 - 1 / (w * C1) + Zsi;
        return { magnitude: Math.log10(Math.sqrt(Zr * Zr + Zi * Zi)), phase: Math.atan2(Zi, Zr) };
      });
    },
  },
];

export default function ImpedanceInput({ onSubmit, loading }: ImpedanceInputProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [magnitude, setMagnitude] = useState<number[]>([]);
  const [phase, setPhase] = useState<number[]>([]);
  const [selectedSample, setSelectedSample] = useState<number>(-1);
  const [manualInput, setManualInput] = useState('');
  const [inputMode, setInputMode] = useState<'sample' | 'manual'>('sample');

  useEffect(() => {
    getConfig().then(setConfig).catch(() => {});
  }, []);

  const handleSampleSelect = (idx: number) => {
    if (!config) return;
    setSelectedSample(idx);
    const data = SAMPLE_CURVES[idx].generate(config.frequencies);
    setMagnitude(data.map(d => d.magnitude));
    setPhase(data.map(d => d.phase));
  };

  const handleManualSubmit = () => {
    try {
      const data = JSON.parse(manualInput);
      if (!data.magnitude || !data.phase) { alert('Need "magnitude" and "phase" arrays'); return; }
      if (data.magnitude.length !== config?.num_freq) { alert(`Need ${config?.num_freq} points`); return; }
      setMagnitude(data.magnitude);
      setPhase(data.phase);
    } catch { alert('Invalid JSON'); }
  };

  const handleGenerate = () => {
    if (magnitude.length === 0) { alert('Select or input impedance data first'); return; }
    onSubmit(magnitude, phase);
  };

  if (!config) {
    return <div className="animate-pulse space-y-2"><div className="h-3 bg-zinc-100 rounded w-3/4" /><div className="h-3 bg-zinc-100 rounded w-1/2" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="grid grid-cols-2 p-0.5 bg-zinc-100 rounded-lg">
        {(['sample', 'manual'] as const).map(mode => (
          <button key={mode} onClick={() => setInputMode(mode)}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              inputMode === mode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}>
            {mode === 'sample' ? 'Samples' : 'JSON'}
          </button>
        ))}
      </div>

      {/* Samples */}
      {inputMode === 'sample' && (
        <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
          {SAMPLE_CURVES.map((sample, idx) => (
            <button key={idx} onClick={() => handleSampleSelect(idx)}
              className={`w-full p-2.5 text-left rounded-lg border transition-all ${
                selectedSample === idx
                  ? 'border-zinc-300 bg-zinc-50 ring-1 ring-zinc-200'
                  : 'border-transparent bg-zinc-50/50 hover:bg-zinc-100'
              }`}>
              <div className="text-xs font-medium text-zinc-800">{sample.name}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{sample.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Manual JSON */}
      {inputMode === 'manual' && (
        <div className="space-y-2">
          <textarea value={manualInput} onChange={(e) => setManualInput(e.target.value)}
            placeholder={`{"magnitude": [...], "phase": [...]}\n// ${config.num_freq} points`}
            className="w-full h-32 p-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-zinc-300 focus:border-transparent outline-none resize-none" />
          <button onClick={handleManualSubmit}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg text-xs border border-zinc-200 transition-colors">
            Parse JSON
          </button>
        </div>
      )}

      {/* Data status */}
      {magnitude.length > 0 && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-[11px] font-semibold text-emerald-700">Data loaded</p>
            <p className="text-[10px] text-emerald-500 font-mono">{magnitude.length} pts [{Math.min(...magnitude).toFixed(1)}, {Math.max(...magnitude).toFixed(1)}]</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}

      {/* Generate */}
      <button onClick={handleGenerate} disabled={loading || magnitude.length === 0}
        className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
          loading || magnitude.length === 0
            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
            : 'bg-zinc-900 text-white hover:bg-zinc-800'
        }`}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : 'Generate Circuit'}
      </button>

      <p className="text-[10px] text-center text-zinc-400 font-mono">
        {config.freq_min.toExponential(0)}&ndash;{config.freq_max.toExponential(0)} Hz
      </p>
    </div>
  );
}
