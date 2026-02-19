"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

// Timeline: Oct=0-14, Nov=14-28, Dec=28-42, Jan=42-56, Fév=56-70
const phases = [
  { label: "Spécifications", start: 0, end: 14, color: colors.blue, row: 0 },
  { label: "Problèmes perso", start: 14, end: 39, color: colors.resistor, row: 1, isGap: true },
  { label: "Création du dataset", start: 39, end: 52, color: colors.cyan, row: 2 },
  { label: "Représentation circuit", start: 39, end: 48, color: colors.purple, row: 3 },
  { label: "Entraînement modèle", start: 44, end: 60, color: colors.green, row: 4 },
  { label: "Backend + Frontend", start: 50, end: 65, color: colors.yellow, row: 5 },
  { label: "Tests & validation", start: 39, end: 68, color: colors.orange, row: 6 },
  { label: "Documents + soutenance", start: 60, end: 70, color: colors.blue, row: 7 },
];

const months = ["Oct", "Nov", "Déc", "Jan", "Fév"];

export default function GanttSlide() {
  const totalWidth = 600;
  const totalUnits = 70;
  const barHeight = 22;
  const rowGap = 32;
  const leftMargin = 150;

  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>
          02 — Planning
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Planning réel du projet
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        Octobre 2025 — Février 2026
      </motion.p>

      <motion.div variants={fadeUp} className="relative">
        <svg width={leftMargin + totalWidth + 20} height={phases.length * rowGap + 60} viewBox={`0 0 ${leftMargin + totalWidth + 20} ${phases.length * rowGap + 60}`}>
          {/* Month markers */}
          {months.map((m, i) => {
            const x = leftMargin + (i * 14 / totalUnits) * totalWidth;
            return (
              <g key={m}>
                <line x1={x} y1={15} x2={x} y2={phases.length * rowGap + 35} stroke={colors.border} strokeWidth="0.5" strokeDasharray="4" />
                <text x={x} y={12} fill={colors.gray} fontSize="10" fontFamily="monospace" textAnchor="middle">{m}</text>
              </g>
            );
          })}

          {/* Gap zone highlight */}
          {(() => {
            const gapX = leftMargin + (14 / totalUnits) * totalWidth;
            const gapW = ((39 - 14) / totalUnits) * totalWidth;
            return (
              <motion.rect x={gapX} y={18} width={gapW} height={phases.length * rowGap + 12}
                fill={`${colors.resistor}06`} rx="4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
            );
          })()}

          {/* Bars */}
          {phases.map((phase, i) => {
            const x = leftMargin + (phase.start / totalUnits) * totalWidth;
            const w = ((phase.end - phase.start) / totalUnits) * totalWidth;
            const y = 25 + i * rowGap;

            return (
              <motion.g key={phase.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring", damping: 20 }}>
                {/* Label */}
                <text x={leftMargin - 8} y={y + barHeight / 2 + 4} textAnchor="end"
                  fill={phase.isGap ? colors.resistor : colors.grayLight} fontSize="11" fontFamily="system-ui">
                  {phase.label}
                </text>

                {/* Bar */}
                {phase.isGap ? (
                  <>
                    <rect x={x} y={y} width={w} height={barHeight} rx="4"
                      fill="none" stroke={colors.resistor} strokeWidth="1.5" strokeDasharray="6" opacity="0.5" />
                    {/* Diagonal hatch pattern for gap */}
                    <motion.line x1={x + 5} y1={y + barHeight} x2={x + w - 5} y2={y}
                      stroke={colors.resistor} strokeWidth="0.5" opacity="0.3"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }} />
                  </>
                ) : (
                  <>
                    <motion.rect x={x} y={y} width={w} height={barHeight} rx="4"
                      fill={`${phase.color}25`} stroke={phase.color} strokeWidth="1"
                      initial={{ width: 0 }}
                      animate={{ width: w }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    />
                    {/* Glow */}
                    <rect x={x} y={y} width={w} height={barHeight} rx="4"
                      fill={`${phase.color}08`} />
                  </>
                )}
              </motion.g>
            );
          })}
        </svg>

        {/* Gap annotation */}
        <motion.div
          className="absolute text-xs font-mono px-2 py-1 rounded border"
          style={{
            top: 1 * rowGap + 30,
            right: 20,
            borderColor: `${colors.resistor}40`,
            color: colors.resistor,
            background: `${colors.resistor}10`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Nov → 20 déc : arrêt — problèmes personnels
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
