"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const risks = [
  { id: "R1", label: "Qualité des données générées", data: [3, 3, 7, 8, 5], color: colors.cyan },
  { id: "R2", label: "Communication encadrants", data: [5, 9, 9, 6, 4], color: colors.resistor },
  { id: "R3", label: "Overfitting du modèle", data: [2, 2, 4, 8, 4], color: colors.orange },
  { id: "R4", label: "Représentation des circuits", data: [8, 8, 6, 2, 1], color: colors.blue },
  { id: "R5", label: "Délai après pause", data: [1, 9, 9, 5, 2], color: colors.purple },
];

const months = ["Oct", "Nov", "Déc", "Jan", "Fév"];

function MiniChart({ data, color, delay }: { data: number[]; color: string; delay: number }) {
  const w = 120, h = 40;
  const maxVal = 10;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (v / maxVal) * h,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg width={w} height={h + 5} viewBox={`0 0 ${w} ${h + 5}`}>
      {/* Area fill */}
      <motion.path
        d={`${pathD} L${w},${h} L0,${h} Z`}
        fill={`${color}10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      />
      {/* Line */}
      <motion.path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.8, ease: "easeOut" }} />
      {/* Dots */}
      {points.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="3" fill={color}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2 + i * 0.1, type: "spring" }} />
      ))}
    </svg>
  );
}

export default function RisquesSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>
          02 — Risques
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Analyse des risques
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        Suivi mensuel de la sévérité (1-10)
      </motion.p>

      {/* Month labels row */}
      <motion.div variants={fadeUp} className="flex items-end gap-6 w-full max-w-4xl">
        <div style={{ width: 200 }} />
        <div className="flex-1 flex justify-between px-1 text-[10px] font-mono" style={{ color: colors.gray }}>
          {months.map((m) => <span key={m}>{m}</span>)}
        </div>
      </motion.div>

      {/* Risk rows */}
      <motion.div className="flex flex-col gap-3 w-full max-w-4xl mt-2" variants={staggerFast}>
        {risks.map((risk, i) => (
          <motion.div key={risk.id} variants={fadeUp}
            className="flex items-center gap-6 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            {/* Left: risk label */}
            <div className="flex items-center gap-3" style={{ width: 200 }}>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${risk.color}20`, color: risk.color }}>
                {risk.id}
              </span>
              <span className="text-xs" style={{ color: colors.grayLight }}>{risk.label}</span>
            </div>
            {/* Right: mini chart */}
            <div className="flex-1">
              <MiniChart data={risk.data} color={risk.color} delay={0.5 + i * 0.15} />
            </div>
            {/* Current value */}
            <motion.span className="text-lg font-bold font-mono w-8 text-right"
              style={{ color: risk.data[risk.data.length - 1] <= 2 ? colors.green : risk.data[risk.data.length - 1] <= 5 ? colors.yellow : colors.resistor }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.15 }}>
              {risk.data[risk.data.length - 1]}
            </motion.span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
