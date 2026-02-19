"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

function AnimatedChart({ data, color, label, delay, maxY }: {
  data: number[]; color: string; label: string; delay: number; maxY: number;
}) {
  const w = 200, h = 100;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (v / maxY) * h,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-mono mb-2" style={{ color }}>{label}</div>
      <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" y1={t * h} x2={w} y2={t * h} stroke={colors.border} strokeWidth="0.5" />
        ))}
        {/* Linear reference */}
        <line x1="0" y1={h} x2={w} y2="0" stroke={colors.grayDark} strokeWidth="1" strokeDasharray="4" />
        {/* Area */}
        <motion.path d={`${pathD} L${w},${h} L0,${h} Z`} fill={`${color}10`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.3 }} />
        {/* Actual line */}
        <motion.path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay, duration: 1, ease: "easeOut" }} />
        {/* Dots */}
        {points.map((p, i) => (
          <motion.circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3 + i * 0.1, type: "spring" }} />
        ))}
      </svg>
      {/* X labels */}
      <div className="flex justify-between w-full text-[9px] font-mono mt-1" style={{ color: colors.gray }}>
        {["Oct", "Nov", "Déc", "Jan", "Fév"].map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  );
}

export default function SperSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>
          02 — SPER
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-8" style={{ color: colors.white }}>
        Indicateurs SPER
      </motion.h2>

      {/* KPI Cards */}
      <motion.div className="flex gap-5 mb-10" variants={staggerContainer}>
        {[
          { value: "~200h", label: "Réalisées", sub: "vs 120h prévues", color: colors.blue },
          { value: "+67%", label: "Écart charge", sub: "rattrapage intense", color: colors.orange },
          { value: "100%", label: "Avancement", sub: "projet livré", color: colors.green },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={scaleIn}
            className="flex flex-col items-center p-5 rounded-xl border" style={{ borderColor: `${kpi.color}30`, background: `${kpi.color}06`, minWidth: 150 }}>
            <div className="text-3xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: colors.white }}>{kpi.label}</div>
            <div className="text-[10px] mt-0.5" style={{ color: colors.gray }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="flex gap-8">
        <motion.div variants={fadeUp}
          className="p-4 rounded-xl border" style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
          <AnimatedChart
            data={[5, 10, 10, 60, 100]}
            color={colors.green}
            label="Avancement (%)"
            delay={0.6}
            maxY={100}
          />
        </motion.div>
        <motion.div variants={fadeUp}
          className="p-4 rounded-xl border" style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
          <AnimatedChart
            data={[10, 25, 25, 120, 200]}
            color={colors.blue}
            label="Charge cumulée (h)"
            delay={0.9}
            maxY={200}
          />
        </motion.div>
        <motion.div variants={fadeUp}
          className="p-4 rounded-xl border" style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
          <AnimatedChart
            data={[0, 15, 80, 50, 0]}
            color={colors.orange}
            label="Retard accumulé (h)"
            delay={1.2}
            maxY={100}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
