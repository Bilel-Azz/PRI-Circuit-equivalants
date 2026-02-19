"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

// Simulated ground truth curve
function gtCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = t * 240;
    const y = 70 - 50 * Math.exp(-((t - 0.35) ** 2) / 0.008) + 6 * Math.sin(t * 20);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

// Predicted curve (slightly offset)
function predCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = t * 240;
    const y = 72 - 48 * Math.exp(-((t - 0.36) ** 2) / 0.009) + 5 * Math.sin(t * 20 + 0.1);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

const metrics = [
  { label: "Self-loops", value: "0%", color: colors.green },
  { label: "Validité brute", value: "~40%", color: colors.yellow },
  { label: "Après réparation", value: "~65%", color: colors.green },
  { label: "RMSE best-of-50", value: "0.35", color: colors.blue },
];

const evolution = [
  { version: "V1-V2", validity: "9%", selfLoops: "42%", rmse: "—", color: colors.resistor },
  { version: "V4", validity: "60%", selfLoops: "0%", rmse: "~1.2", color: colors.orange },
  { version: "V5", validity: "~40%", selfLoops: "0%", rmse: "0.35", color: colors.green },
];

export default function ResultatsSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Résultats
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-8" style={{ color: colors.white }}>
        Résultats du modèle
      </motion.h2>

      <div className="flex gap-8 w-full max-w-5xl">
        {/* Left: curve comparison */}
        <motion.div variants={fadeUp}
          className="p-5 rounded-2xl border"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
          <div className="text-sm font-mono mb-3" style={{ color: colors.grayLight }}>
            Comparaison Ground Truth vs Prédiction
          </div>
          <svg width="240" height="100" viewBox="0 0 240 100">
            {/* Grid */}
            {[0.25, 0.5, 0.75].map((t) => (
              <line key={t} x1="0" y1={t * 100} x2="240" y2={t * 100} stroke={colors.border} strokeWidth="0.5" />
            ))}
            {/* Ground truth */}
            <motion.path d={gtCurve()} fill="none" stroke={colors.green} strokeWidth="2" strokeLinecap="round"
              variants={drawPath} />
            {/* Predicted */}
            <motion.path d={predCurve()} fill="none" stroke={colors.cyan} strokeWidth="2" strokeLinecap="round"
              strokeDasharray="6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.2, ease: "easeInOut" }} />
          </svg>
          <div className="flex gap-4 mt-2 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <div className="w-3 h-[2px]" style={{ background: colors.green }} />
              <span style={{ color: colors.green }}>Ground Truth</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-[2px] border-b border-dashed" style={{ borderColor: colors.cyan }} />
              <span style={{ color: colors.cyan }}>Prédiction</span>
            </div>
          </div>
        </motion.div>

        {/* Right: metrics + evolution table */}
        <div className="flex flex-col gap-5 flex-1">
          {/* KPI row */}
          <motion.div className="grid grid-cols-4 gap-3" variants={staggerContainer}>
            {metrics.map((m) => (
              <motion.div key={m.label} variants={scaleIn}
                className="flex flex-col items-center p-3 rounded-xl border"
                style={{ borderColor: `${m.color}25`, background: `${m.color}06` }}>
                <div className="text-xl font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[10px] mt-0.5 text-center" style={{ color: colors.gray }}>{m.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Evolution table */}
          <motion.div variants={fadeUp}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
            <div className="px-4 py-2 text-xs font-mono border-b" style={{ borderColor: colors.border, color: colors.grayLight }}>
              Évolution par version
            </div>
            <div className="p-2">
              {/* Header */}
              <div className="flex gap-2 px-2 py-1 text-[10px] font-mono" style={{ color: colors.gray }}>
                <span className="w-16">Version</span>
                <span className="w-16 text-center">Validité</span>
                <span className="w-16 text-center">Self-loops</span>
                <span className="w-20 text-center">RMSE (best-of-50)</span>
              </div>
              {evolution.map((row, i) => (
                <motion.div key={row.version}
                  className="flex gap-2 px-2 py-1.5 rounded-lg text-sm items-center"
                  style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 + i * 0.15 }}>
                  <span className="w-16 font-mono font-bold text-xs" style={{ color: row.color }}>{row.version}</span>
                  <span className="w-16 text-center text-xs" style={{ color: colors.white }}>{row.validity}</span>
                  <span className="w-16 text-center text-xs" style={{ color: row.selfLoops === "0%" ? colors.green : colors.resistor }}>{row.selfLoops}</span>
                  <span className="w-20 text-center text-xs" style={{ color: colors.white }}>{row.rmse}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
