'use client';

import { Component } from '@/lib/api';
import { useState, useRef, useEffect, useCallback } from 'react';

interface CircuitDisplayProps {
  components: Component[];
  compact?: boolean;
}

// Lighter SVG component symbols (stroke set by parent)
const SYMBOLS = {
  R: (
    <path d="M-20 0 L-14 0 L-11 -7 L-5 7 L1 -7 L7 7 L11 0 L20 0" fill="none" strokeWidth="2" stroke="currentColor" />
  ),
  L: (
    <path d="M-20 0 L-14 0 Q-10 -9 -6 0 Q-2 -9 2 0 Q6 -9 10 0 Q14 -9 16 0 L20 0" fill="none" strokeWidth="2" stroke="currentColor" />
  ),
  C: (
    <g strokeWidth="2" stroke="currentColor">
      <path d="M-20 0 L-3 0" />
      <path d="M20 0 L3 0" />
      <line x1="-3" y1="-10" x2="-3" y2="10" strokeWidth="2.5" />
      <line x1="3" y1="-10" x2="3" y2="10" strokeWidth="2.5" />
    </g>
  ),
  SOURCE: (
    <g>
      <circle cx="0" cy="0" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M-7 0 Q-3 -5 0 0 T7 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </g>
  ),
};

const COMP_COLORS: Record<string, string> = {
  R: '#f97316',
  L: '#3b82f6',
  C: '#10b981',
};

type NodePair = string;
function pairKey(a: number, b: number): NodePair {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

export default function CircuitDisplay({ components, compact }: CircuitDisplayProps) {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleReset = useCallback(() => {
    if (!containerRef.current || !components.length) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scaleX = width / SCENE_WIDTH;
    const scaleY = height / SCENE_HEIGHT;
    const s = Math.min(scaleX, scaleY) * 0.85;
    setTransform({
      x: (width - SCENE_WIDTH * s) / 2,
      y: (height - SCENE_HEIGHT * s) / 2,
      k: s,
    });
  }, [components]);

  useEffect(() => {
    if (components.length > 0) {
      // Slight delay so container has rendered
      requestAnimationFrame(handleReset);
    }
  }, [components, handleReset]);

  if (!components || components.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[hsl(var(--muted-foreground))] text-sm">
        No circuit data
      </div>
    );
  }

  // ── Topology Analysis ──
  const nodes = new Set<number>();
  components.forEach((c) => { nodes.add(c.node_a); nodes.add(c.node_b); });
  const signalNodes = Array.from(nodes).filter(n => n !== 0).sort((a, b) => a - b);

  // Group components by node pair to detect parallel connections
  const pairMap = new Map<NodePair, Component[]>();
  components.forEach(c => {
    const key = pairKey(c.node_a, c.node_b);
    if (!pairMap.has(key)) pairMap.set(key, []);
    pairMap.get(key)!.push(c);
  });

  // Categorize
  const shuntGroups: { node: number; comps: Component[] }[] = [];
  const seriesGroups: { nodeA: number; nodeB: number; comps: Component[] }[] = [];
  const bypassGroups: { nodeA: number; nodeB: number; comps: Component[] }[] = [];

  pairMap.forEach((comps, key) => {
    const [a, b] = key.split('-').map(Number);
    if (a === 0 || b === 0) {
      const signalNode = a === 0 ? b : a;
      shuntGroups.push({ node: signalNode, comps });
    } else {
      const idxA = signalNodes.indexOf(a);
      const idxB = signalNodes.indexOf(b);
      if (Math.abs(idxA - idxB) === 1) {
        seriesGroups.push({ nodeA: a, nodeB: b, comps });
      } else {
        bypassGroups.push({ nodeA: a, nodeB: b, comps });
      }
    }
  });

  // Layout
  const GRID = 140;
  const PADDING = 90;
  const SCENE_WIDTH = Math.max(800, (signalNodes.length + 1) * GRID + PADDING * 2);
  const SCENE_HEIGHT = 420;
  const MAIN_Y = 160;
  const BOT_Y = 340;
  const SOURCE_X = PADDING;

  const nodeX = new Map<number, number>();
  signalNodes.forEach((n, i) => { nodeX.set(n, PADDING + (i + 1) * GRID); });

  // ── Handlers ──
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const f = 1.08;
    const nk = e.deltaY < 0 ? transform.k * f : transform.k / f;
    if (nk < 0.15 || nk > 6) return;
    setTransform(prev => ({ ...prev, k: nk }));
  };
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setLastPos({ x: e.clientX, y: e.clientY }); };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: prev.x + e.clientX - lastPos.x, y: prev.y + e.clientY - lastPos.y }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setIsDragging(false);

  // ── Helper: draw a component symbol with label ──
  function renderComp(comp: Component, cx: number, cy: number, rotate: boolean, labelSide: 'top' | 'right' = 'top') {
    const color = COMP_COLORS[comp.type] || '#888';
    const rot = rotate ? 'rotate(90)' : '';
    const lx = labelSide === 'right' ? 28 : 0;
    const ly = labelSide === 'right' ? 4 : -14;
    const anchor = labelSide === 'right' ? 'start' : 'middle';

    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <g transform={rot} style={{ color }}>
          {SYMBOLS[comp.type as 'R' | 'L' | 'C']}
        </g>
        <text x={lx} y={ly} textAnchor={anchor} fill={color} className="text-[10px] font-semibold font-mono">
          {comp.formatted_value}
        </text>
      </g>
    );
  }

  // ── Helper: draw parallel group between two points ──
  function renderParallelGroup(comps: Component[], x1: number, y1: number, x2: number, y2: number, baseColor: string, labelSide: 'top' | 'right' = 'top') {
    if (comps.length === 1) {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const isVertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
      return (
        <g>
          {isVertical ? (
            <>
              <line x1={x1} y1={y1} x2={cx} y2={cy - 20} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={cx} y1={cy + 20} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" />
            </>
          ) : (
            <>
              <line x1={x1} y1={y1} x2={cx - 20} y2={cy} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={cx + 20} y1={cy} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" />
            </>
          )}
          {renderComp(comps[0], cx, cy, isVertical, labelSide)}
        </g>
      );
    }

    // Multiple components in parallel — draw split paths
    const isVertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    const n = comps.length;
    const spacing = isVertical ? 60 : 50;
    const totalWidth = (n - 1) * spacing;

    return (
      <g>
        {comps.map((comp, i) => {
          const offset = -totalWidth / 2 + i * spacing;

          if (isVertical) {
            // Vertical parallel: spread horizontally
            const midY = (y1 + y2) / 2;
            const ox = x1 + offset;
            return (
              <g key={i}>
                {/* Top wire */}
                <path d={`M ${x1} ${y1} L ${ox} ${y1} L ${ox} ${midY - 20}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Bottom wire */}
                <path d={`M ${ox} ${midY + 20} L ${ox} ${y2} L ${x1} ${y2}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Component */}
                {renderComp(comp, ox, midY, true, 'right')}
              </g>
            );
          } else {
            // Horizontal parallel: spread vertically
            const midX = (x1 + x2) / 2;
            const oy = y1 + offset;
            return (
              <g key={i}>
                {/* Left wire */}
                <path d={`M ${x1} ${y1} L ${x1} ${oy} L ${midX - 20} ${oy}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Right wire */}
                <path d={`M ${midX + 20} ${oy} L ${x2} ${oy} L ${x2} ${y2}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Component */}
                {renderComp(comp, midX, oy, false, 'top')}
              </g>
            );
          }
        })}
      </g>
    );
  }

  // Assign bypass levels
  const bypassLevels = new Map<string, number>();
  const usedLevels: { min: number; max: number; level: number }[] = [];
  bypassGroups.forEach(g => {
    const a = signalNodes.indexOf(g.nodeA);
    const b = signalNodes.indexOf(g.nodeB);
    const mn = Math.min(a, b), mx = Math.max(a, b);
    let level = 1;
    while (usedLevels.some(u => u.level === level && !(mx < u.min || mn > u.max))) level++;
    bypassLevels.set(pairKey(g.nodeA, g.nodeB), level);
    usedLevels.push({ min: mn, max: mx, level });
  });

  const containerHeight = compact ? 'h-[320px]' : 'h-[420px]';

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={`bg-white rounded-xl border border-[hsl(var(--border))] relative overflow-hidden ${containerHeight} cursor-grab active:cursor-grabbing`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f010_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f010_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex gap-1 bg-white/90 backdrop-blur border border-[hsl(var(--border))] rounded-lg p-0.5 shadow-sm z-10">
          <button onClick={() => setTransform(t => ({ ...t, k: t.k * 1.2 }))} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm font-medium">+</button>
          <button onClick={() => setTransform(t => ({ ...t, k: t.k / 1.2 }))} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm font-medium">-</button>
          <button onClick={handleReset} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-xs">&#8634;</button>
        </div>

        <svg width="100%" height="100%" className="select-none">
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {/* ── Rails ── */}
            {/* Source */}
            <g transform={`translate(${SOURCE_X}, ${MAIN_Y})`} style={{ color: '#3b82f6' }}>
              {SYMBOLS.SOURCE}
              <text x="-32" y="5" textAnchor="end" className="text-[10px] font-semibold font-mono" fill="#64748b">VAC</text>
            </g>

            {/* Main horizontal wire — segmented to avoid short-circuiting series components */}
            {(() => {
              const seriesPairSet = new Set<string>();
              seriesGroups.forEach(g => seriesPairSet.add(pairKey(g.nodeA, g.nodeB)));

              const segments: [number, number][] = [];
              // Source to first signal node
              segments.push([SOURCE_X + 16, nodeX.get(signalNodes[0])!]);
              // Between adjacent nodes — only where NO series component exists
              for (let i = 0; i < signalNodes.length - 1; i++) {
                const a = signalNodes[i], b = signalNodes[i + 1];
                if (!seriesPairSet.has(pairKey(a, b))) {
                  segments.push([nodeX.get(a)!, nodeX.get(b)!]);
                }
              }
              // Last node to end
              const lastX = nodeX.get(signalNodes[signalNodes.length - 1])!;
              segments.push([lastX, lastX + 20]);

              return segments.map(([sx, ex], i) => (
                <line key={`main-wire-${i}`} x1={sx} y1={MAIN_Y} x2={ex} y2={MAIN_Y}
                  stroke="#94a3b8" strokeWidth="2" />
              ));
            })()}

            {/* Ground rail */}
            <line x1={SOURCE_X} y1={BOT_Y} x2={nodeX.get(signalNodes[signalNodes.length - 1])! + 20} y2={BOT_Y}
              stroke="#94a3b8" strokeWidth="2" />

            {/* Source to ground */}
            <line x1={SOURCE_X} y1={MAIN_Y + 16} x2={SOURCE_X} y2={BOT_Y}
              stroke="#94a3b8" strokeWidth="2" />

            {/* ── Shunt components (to ground) ── */}
            {shuntGroups.map((group, gi) => {
              const x = nodeX.get(group.node)!;
              return (
                <g key={`shunt-${gi}`}>
                  {renderParallelGroup(group.comps, x, MAIN_Y, x, BOT_Y, '#3b82f6', 'right')}
                </g>
              );
            })}

            {/* ── Series components (main path, adjacent nodes) ── */}
            {seriesGroups.map((group, gi) => {
              const xA = nodeX.get(group.nodeA)!;
              const xB = nodeX.get(group.nodeB)!;
              return (
                <g key={`series-${gi}`}>
                  {renderParallelGroup(group.comps, xA, MAIN_Y, xB, MAIN_Y, '#f97316', 'top')}
                </g>
              );
            })}

            {/* ── Bypass components (skip connections) ── */}
            {bypassGroups.map((group, gi) => {
              const xA = nodeX.get(group.nodeA)!;
              const xB = nodeX.get(group.nodeB)!;
              const level = bypassLevels.get(pairKey(group.nodeA, group.nodeB)) || 1;
              const arcY = MAIN_Y - 45 - (level - 1) * 55;
              const cx = (xA + xB) / 2;

              if (group.comps.length === 1) {
                const comp = group.comps[0];
                const color = COMP_COLORS[comp.type] || '#888';
                return (
                  <g key={`bypass-${gi}`}>
                    <path d={`M ${xA} ${MAIN_Y} C ${xA} ${arcY}, ${xA + 30} ${arcY}, ${cx - 20} ${arcY}`}
                      fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                    <path d={`M ${cx + 20} ${arcY} C ${xB - 30} ${arcY}, ${xB} ${arcY}, ${xB} ${MAIN_Y}`}
                      fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                    {renderComp(comp, cx, arcY, false, 'top')}
                  </g>
                );
              }

              // Multiple bypass — stack vertically
              return (
                <g key={`bypass-${gi}`}>
                  {group.comps.map((comp, ci) => {
                    const ay = arcY - ci * 40;
                    const color = COMP_COLORS[comp.type] || '#888';
                    return (
                      <g key={ci}>
                        <path d={`M ${xA} ${MAIN_Y} C ${xA} ${ay}, ${xA + 30} ${ay}, ${cx - 20} ${ay}`}
                          fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                        <path d={`M ${cx + 20} ${ay} C ${xB - 30} ${ay}, ${xB} ${ay}, ${xB} ${MAIN_Y}`}
                          fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                        {renderComp(comp, cx, ay, false, 'top')}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {signalNodes.map((n) => (
              <g key={n} transform={`translate(${nodeX.get(n)}, ${MAIN_Y})`}>
                <circle r="4" fill="white" stroke="#475569" strokeWidth="2" />
                <text y="22" textAnchor="middle" className="text-[9px] font-semibold" fill="#94a3b8">N{n}</text>
              </g>
            ))}

            {/* Ground symbol */}
            <g transform={`translate(${nodeX.get(signalNodes[signalNodes.length - 1])! + 20}, ${BOT_Y})`}>
              <line x1="0" y1="0" x2="0" y2="7" stroke="#94a3b8" strokeWidth="2" />
              <line x1="-10" y1="7" x2="10" y2="7" stroke="#94a3b8" strokeWidth="2" />
              <line x1="-6" y1="12" x2="6" y2="12" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="-2" y1="17" x2="2" y2="17" stroke="#94a3b8" strokeWidth="1" />
            </g>
          </g>
        </svg>
      </div>

      {/* Component list */}
      <div className="flex flex-wrap gap-2">
        {components.map((comp, idx) => (
          <div key={idx} className={`chip-${comp.type.toLowerCase()}`}>
            <span className="font-bold">{comp.type}</span>
            <span className="font-mono text-[11px]">{comp.formatted_value}</span>
            <span className="text-[9px] opacity-60">N{comp.node_a}-N{comp.node_b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
