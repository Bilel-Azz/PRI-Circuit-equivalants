"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

/* Compute real RLC series impedance magnitude curve as SVG path */
function magnitudePath(): string {
  const R = 100, L = 0.01, C = 1e-6;
  const pts: string[] = [];
  const N = 80;
  const fMin = 10, fMax = 1e7;
  // Compute all magnitudes first for scaling
  const mags: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const f = fMin * Math.pow(fMax / fMin, t);
    const w = 2 * Math.PI * f;
    const Zi = w * L - 1 / (w * C);
    mags.push(Math.log10(Math.sqrt(R * R + Zi * Zi)));
  }
  const minM = Math.min(...mags);
  const maxM = Math.max(...mags);
  for (let i = 0; i <= N; i++) {
    const x = 15 + (i / N) * 185;
    const y = 10 + (1 - (mags[i] - minM) / (maxM - minM)) * 80;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* Compute phase curve */
function phasePath(): string {
  const R = 100, L = 0.01, C = 1e-6;
  const pts: string[] = [];
  const N = 80;
  const fMin = 10, fMax = 1e7;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const f = fMin * Math.pow(fMax / fMin, t);
    const w = 2 * Math.PI * f;
    const Zi = w * L - 1 / (w * C);
    const phase = Math.atan2(Zi, R); // radians
    const x = 15 + t * 185;
    const y = 50 - phase * (40 / (Math.PI / 2)); // ±π/2 → ±40px
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* Find resonance frequency x-position for annotation */
function resonanceX(): number {
  const L = 0.01, C = 1e-6;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const fMin = 10, fMax = 1e7;
  const t = Math.log10(f0 / fMin) / Math.log10(fMax / fMin);
  return 15 + t * 185;
}

export default function ImpedanceSlide() {
  const magD = magnitudePath();
  const phaseD = phasePath();
  const resX = resonanceX();

  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{ background: `${colors.blue}15`, color: colors.blue }}
        >
          01 — Impédance
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        {"L'impédance Z(f)"}
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-8"
        style={{ color: colors.grayLight }}
      >
        {"La « signature fréquentielle » d'un circuit"}
      </motion.p>

      {/* Pipeline: Circuit → Sweep → Curve */}
      <div className="flex items-center gap-5 w-full max-w-5xl">
        {/* Left: Circuit */}
        <motion.div
          className="flex flex-col items-center p-5 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}30`, background: `${colors.cyan}06`, width: 220 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="text-xs font-mono mb-3" style={{ color: colors.cyan }}>
            Un circuit RLC série
          </div>
          <svg viewBox="0 0 130 35" className="w-36 h-9">
            <line x1="0" y1="17" x2="12" y2="17" stroke={colors.grayDark} strokeWidth="1" />
            <rect x="12" y="10" width="20" height="14" rx="3" fill={`${colors.resistor}25`} stroke={colors.resistor} strokeWidth="0.8" />
            <text x="22" y="20" textAnchor="middle" fill={colors.resistor} fontSize="7" fontWeight="bold" fontFamily="monospace">R</text>
            <line x1="32" y1="17" x2="42" y2="17" stroke={colors.grayDark} strokeWidth="1" />
            <rect x="42" y="10" width="20" height="14" rx="3" fill={`${colors.inductor}25`} stroke={colors.inductor} strokeWidth="0.8" />
            <text x="52" y="20" textAnchor="middle" fill={colors.inductor} fontSize="7" fontWeight="bold" fontFamily="monospace">L</text>
            <line x1="62" y1="17" x2="72" y2="17" stroke={colors.grayDark} strokeWidth="1" />
            <rect x="72" y="10" width="20" height="14" rx="3" fill={`${colors.capacitor}25`} stroke={colors.capacitor} strokeWidth="0.8" />
            <text x="82" y="20" textAnchor="middle" fill={colors.capacitor} fontSize="7" fontWeight="bold" fontFamily="monospace">C</text>
            <line x1="92" y1="17" x2="130" y2="17" stroke={colors.grayDark} strokeWidth="1" />
          </svg>
          <div className="text-[10px] mt-2 font-mono" style={{ color: colors.gray }}>
            R=100Ω &nbsp; L=10mH &nbsp; C=1µF
          </div>
        </motion.div>

        {/* Center: Arrow + Sweep */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <svg width="100" height="24">
            <motion.line
              x1="5" y1="12" x2="80" y2="12"
              stroke={colors.blue} strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            />
            <motion.polygon
              points="78,6 94,12 78,18"
              fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            />
          </svg>
          <div className="text-[10px] font-mono text-center leading-tight" style={{ color: colors.grayLight }}>
            On balaye<br />
            <span style={{ color: colors.blue }}>f : 10 Hz → 10 MHz</span>
          </div>
          <div className="text-[9px] px-2 py-1 rounded-md" style={{ background: `${colors.blue}15`, color: colors.blue }}>
            100 fréquences (log)
          </div>
        </motion.div>

        {/* Right: Impedance curve */}
        <motion.div
          className="flex flex-col items-center p-5 rounded-2xl border"
          style={{ borderColor: `${colors.green}30`, background: `${colors.green}06`, flex: 1 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div className="text-xs font-mono mb-2" style={{ color: colors.green }}>
            Courbe d{"'"}impédance Z(f)
          </div>

          <svg viewBox="0 0 220 110" className="w-full h-28">
            {/* Axes */}
            <line x1="15" y1="100" x2="205" y2="100" stroke={colors.grayDark} strokeWidth="0.5" />
            <line x1="15" y1="5" x2="15" y2="100" stroke={colors.grayDark} strokeWidth="0.5" />

            {/* Axis labels */}
            <text x="110" y="109" textAnchor="middle" fill={colors.gray} fontSize="6" fontFamily="monospace">fréquence (log)</text>
            <text x="5" y="8" fill={colors.cyan} fontSize="5" fontFamily="monospace">|Z|</text>
            <text x="5" y="55" fill={colors.orange} fontSize="5" fontFamily="monospace">φ</text>

            {/* Magnitude curve */}
            <motion.path
              d={magD}
              fill="none"
              stroke={colors.cyan}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
            />
            {/* Magnitude glow */}
            <motion.path
              d={magD}
              fill="none"
              stroke={colors.cyan}
              strokeWidth="8"
              strokeLinecap="round"
              opacity={0.12}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
            />

            {/* Phase curve */}
            <motion.path
              d={phaseD}
              fill="none"
              stroke={colors.orange}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ delay: 1.5, duration: 1.5, ease: "easeInOut" }}
            />

            {/* Resonance annotation */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 }}
            >
              <line x1={resX} y1="15" x2={resX} y2="95" stroke={colors.yellow} strokeWidth="0.8" strokeDasharray="3 2" />
              <circle cx={resX} cy="90" r="2" fill={colors.yellow} />
              <text x={resX + 4} y="20" fill={colors.yellow} fontSize="5.5" fontFamily="monospace">
                résonance f₀
              </text>
            </motion.g>

            {/* Legend */}
            <line x1="150" y1="8" x2="165" y2="8" stroke={colors.cyan} strokeWidth="2" />
            <text x="168" y="10" fill={colors.cyan} fontSize="5" fontFamily="monospace">|Z(f)|</text>
            <line x1="150" y1="16" x2="165" y2="16" stroke={colors.orange} strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="168" y="18" fill={colors.orange} fontSize="5" fontFamily="monospace">phase</text>
          </svg>
        </motion.div>
      </div>

      {/* Bottom insight */}
      <motion.div
        className="mt-6 px-6 py-3 rounded-xl border max-w-3xl"
        style={{ borderColor: `${colors.yellow}30`, background: `${colors.yellow}08` }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">💡</span>
          <span className="text-sm" style={{ color: colors.yellow }}>
            {"Chaque circuit a une courbe unique — c'est son « empreinte digitale »"}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
