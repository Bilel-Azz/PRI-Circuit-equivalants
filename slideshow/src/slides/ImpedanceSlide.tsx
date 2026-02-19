"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

// Generate impedance-like curve points
function generateCurvePath(width: number, height: number): string {
  const points: string[] = [];
  const n = 100;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = t * width;
    // Simulate a resonance curve: dip then peak
    const base = 0.5;
    const resonance = 0.35 * Math.exp(-((t - 0.35) ** 2) / 0.005);
    const antiRes = -0.25 * Math.exp(-((t - 0.65) ** 2) / 0.008);
    const noise = 0.02 * Math.sin(t * 30);
    const y = height * (1 - (base + resonance + antiRes + noise));
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

const curvePath = generateCurvePath(500, 200);

// Phase curve
function generatePhasePath(width: number, height: number): string {
  const points: string[] = [];
  const n = 100;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = t * width;
    const phase = 0.5 + 0.3 * Math.atan((t - 0.35) * 20) / Math.PI - 0.2 * Math.atan((t - 0.65) * 15) / Math.PI;
    const y = height * (1 - phase);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

const phasePath = generatePhasePath(500, 200);

export default function ImpedanceSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        variants={fadeUp}
        className="text-5xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Imp&eacute;dance Z(f)
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-lg mb-8"
        style={{ color: colors.grayLight }}
      >
        La signature fr&eacute;quentielle d&apos;un circuit
      </motion.p>

      {/* Equation */}
      <motion.div
        variants={fadeUp}
        className="font-mono text-2xl mb-10 px-6 py-3 rounded-xl border"
        style={{
          borderColor: colors.border,
          background: `${colors.blue}08`,
          color: colors.cyan,
        }}
      >
        Z(f) = |Z| &middot; e<sup>j&phi;</sup> &nbsp;&nbsp;=&nbsp;&nbsp; R + jX
      </motion.div>

      {/* Charts side by side */}
      <div className="flex gap-8">
        {/* Magnitude chart */}
        <motion.div
          variants={fadeUp}
          className="relative rounded-xl border p-4"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        >
          <div className="text-sm font-mono mb-2" style={{ color: colors.cyan }}>
            |Z(f)| &mdash; Magnitude
          </div>
          <svg width="500" height="200" viewBox="0 0 500 200">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1="0" y1={t * 200} x2="500" y2={t * 200}
                stroke={colors.border} strokeWidth="0.5" strokeDasharray="4"
              />
            ))}
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={`v${t}`}
                x1={t * 500} y1="0" x2={t * 500} y2="200"
                stroke={colors.border} strokeWidth="0.5" strokeDasharray="4"
              />
            ))}
            {/* Curve */}
            <motion.path
              d={curvePath}
              fill="none"
              stroke={colors.cyan}
              strokeWidth="2.5"
              strokeLinecap="round"
              variants={drawPath}
            />
            {/* Glow */}
            <motion.path
              d={curvePath}
              fill="none"
              stroke={colors.cyan}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.15"
              variants={drawPath}
            />
            {/* Resonance marker */}
            <motion.circle
              cx="175" cy="30" r="5"
              fill={colors.yellow}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, type: "spring" }}
            />
            <motion.text
              x="185" y="25"
              fill={colors.yellow}
              fontSize="12"
              fontFamily="monospace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              f&#8320; resonance
            </motion.text>
          </svg>
          {/* Axis labels */}
          <div className="flex justify-between text-xs font-mono mt-1" style={{ color: colors.gray }}>
            <span>1 Hz</span>
            <span>log(f)</span>
            <span>10 MHz</span>
          </div>
        </motion.div>

        {/* Phase chart */}
        <motion.div
          variants={fadeUp}
          className="relative rounded-xl border p-4"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        >
          <div className="text-sm font-mono mb-2" style={{ color: colors.purple }}>
            &phi;(f) &mdash; Phase
          </div>
          <svg width="500" height="200" viewBox="0 0 500 200">
            {/* Grid */}
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1="0" y1={t * 200} x2="500" y2={t * 200}
                stroke={colors.border} strokeWidth="0.5" strokeDasharray="4"
              />
            ))}
            {/* Phase curve */}
            <motion.path
              d={phasePath}
              fill="none"
              stroke={colors.purple}
              strokeWidth="2.5"
              strokeLinecap="round"
              variants={drawPath}
            />
            <motion.path
              d={phasePath}
              fill="none"
              stroke={colors.purple}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.15"
              variants={drawPath}
            />
          </svg>
          <div className="flex justify-between text-xs font-mono mt-1" style={{ color: colors.gray }}>
            <span>-90&deg;</span>
            <span>phase</span>
            <span>+90&deg;</span>
          </div>
        </motion.div>
      </div>

      {/* Input format note */}
      <motion.div
        className="mt-8 font-mono text-sm px-4 py-2 rounded-lg border"
        style={{ borderColor: `${colors.blue}30`, color: colors.grayLight }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        Input: (2, 100) &mdash; 100 fr&eacute;quences log-spaced &times; [log|Z|, &phi;]
      </motion.div>
    </motion.div>
  );
}
