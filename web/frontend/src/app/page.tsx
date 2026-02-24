'use client';

import { useState, useEffect } from 'react';
import ImpedanceInput from '@/components/ImpedanceInput';
import ImpedanceChart from '@/components/ImpedanceChart';
import CircuitDisplay from '@/components/CircuitDisplay';
import CandidateCard from '@/components/CandidateCard';
import { generateCircuit, checkHealth, GenerateResponse, Impedance, HealthCheck } from '@/lib/api';

export default function Home() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [targetImpedance, setTargetImpedance] = useState<Impedance | null>(null);
  const [numCandidates, setNumCandidates] = useState(100);
  const [tau, setTau] = useState(0.5);

  useEffect(() => {
    checkHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  const handleGenerate = async (magnitude: number[], phase: number[]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTargetImpedance({ magnitude, phase, frequencies: [] });

    try {
      const response = await generateCircuit(magnitude, phase, { tau, num_candidates: numCandidates });
      if (response.success && response.best) {
        setTargetImpedance({ magnitude, phase, frequencies: response.best.impedance.frequencies });
      }
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const exportSPICE = () => {
    if (!result?.best) return;
    const fmt = (val: number, type: string) => {
      if (type === 'R') return val >= 1e6 ? `${(val/1e6).toFixed(3)}Meg` : val >= 1e3 ? `${(val/1e3).toFixed(3)}k` : `${val.toFixed(3)}`;
      if (type === 'L') return val >= 1 ? `${val.toFixed(6)}` : val >= 1e-3 ? `${(val*1e3).toFixed(3)}m` : val >= 1e-6 ? `${(val*1e6).toFixed(3)}u` : `${(val*1e9).toFixed(3)}n`;
      if (type === 'C') return val >= 1e-6 ? `${(val*1e6).toFixed(3)}u` : val >= 1e-9 ? `${(val*1e9).toFixed(3)}n` : `${(val*1e12).toFixed(3)}p`;
      return val.toString();
    };
    let spice = '* Circuit Synthesis AI\nVAC 1 0 AC 1\n\n';
    result.best.components.forEach((c, i) => { spice += `${c.type}${i+1} ${c.node_a} ${c.node_b} ${fmt(c.value, c.type)}\n`; });
    spice += '\n.AC DEC 100 10 10Meg\n.END\n';
    const blob = new Blob([spice], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'circuit.cir';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-[hsl(var(--border))] bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base font-semibold tracking-tight">Circuit Synthesis AI</h1>
          </div>

          {health ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium">Online ({health.device})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-medium">Disconnected</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <aside className="lg:col-span-3 space-y-4">
            <div className="panel p-5">
              <h2 className="text-sm font-medium mb-4 flex items-center gap-2 text-zinc-700">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                </svg>
                Impedance Input
              </h2>
              <ImpedanceInput onSubmit={handleGenerate} loading={loading} />
            </div>

            <div className="panel p-5">
              <h2 className="text-sm font-medium mb-4 flex items-center gap-2 text-zinc-700">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Parameters
              </h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-zinc-500">Candidates</label>
                    <span className="text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">{numCandidates}</span>
                  </div>
                  <input type="range" min="10" max="200" step="10" value={numCandidates}
                    onChange={(e) => setNumCandidates(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-zinc-500">Temperature (τ)</label>
                    <span className="text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">{tau.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0.1" max="2" step="0.1" value={tau}
                    onChange={(e) => setTau(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-5">
            {error && (
              <div className="panel border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800">Generation failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="panel p-16 flex flex-col items-center justify-center">
                <div className="relative w-12 h-12 mb-6">
                  <div className="absolute inset-0 border-[3px] border-zinc-100 rounded-full" />
                  <div className="absolute inset-0 border-[3px] border-zinc-900 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-zinc-700">Synthesizing circuit...</p>
                <p className="text-xs text-zinc-400 mt-1">Evaluating {numCandidates} candidates</p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="panel p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-700">Ready to generate</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Select an impedance curve on the left and click Generate to synthesize a circuit.
                </p>
              </div>
            )}

            {result && result.success && result.best && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="panel p-4 text-center">
                    <p className="text-2xl font-bold font-mono text-zinc-900">{result.best.error.magnitude.toFixed(3)}</p>
                    <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">Mag Error</p>
                  </div>
                  <div className="panel p-4 text-center">
                    <p className="text-2xl font-bold font-mono text-zinc-900">{(result.best.error.phase * 180 / Math.PI).toFixed(1)}&deg;</p>
                    <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">Phase Error</p>
                  </div>
                  <div className="panel p-4 text-center">
                    <p className="text-2xl font-bold font-mono text-zinc-900">{result.num_candidates}</p>
                    <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">Evaluated</p>
                  </div>
                </div>

                {result.stats && (
                  <div className="flex items-center gap-3 text-xs text-zinc-500 px-1">
                    <span className="text-emerald-600 font-medium">{result.stats.valid} valid</span>
                    <span className="text-zinc-300">|</span>
                    <span className="text-red-500 font-medium">{result.stats.invalid} invalid</span>
                    {result.stats.empty > 0 && (
                      <>
                        <span className="text-zinc-300">|</span>
                        <span className="text-amber-500 font-medium">{result.stats.empty} empty</span>
                      </>
                    )}
                    <span className="text-zinc-300">|</span>
                    <span>{result.stats.total} total</span>
                  </div>
                )}

                <div className="panel p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-700">Impedance Response</h3>
                  </div>
                  <ImpedanceChart target={targetImpedance || undefined} predicted={result.best.impedance} />
                </div>

                <div className="panel p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-700">Circuit Topology</h3>
                    <div className="flex gap-2">
                      <button onClick={exportSPICE}
                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors">
                        Export SPICE
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result.best!.components, null, 2)); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors">
                        Copy JSON
                      </button>
                    </div>
                  </div>
                  <CircuitDisplay components={result.best.components} />
                </div>

                {result.candidates.length > 1 && (
                  <div className="panel p-5">
                    <h3 className="text-sm font-medium text-zinc-700 mb-3">
                      Alternative Candidates
                      <span className="text-zinc-400 font-normal ml-2">({result.candidates.length - 1} more)</span>
                    </h3>
                    <div className="space-y-2 candidates-scroll">
                      {result.candidates.slice(1).map((cand, idx) => (
                        <CandidateCard
                          key={idx}
                          candidate={cand}
                          rank={idx + 2}
                          targetImpedance={targetImpedance || undefined}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
