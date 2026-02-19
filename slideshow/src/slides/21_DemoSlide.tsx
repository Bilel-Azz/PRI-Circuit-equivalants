"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, pulse } from "@/lib/animations";
import { colors } from "@/lib/theme";

const stats = [
  { label: "Dataset", value: "150k", sub: "circuits synthétiques" },
  { label: "RMSE", value: "0.35", sub: "best-of-50 candidats" },
  { label: "Latence", value: "<2s", sub: "50 candidats générés" },
  { label: "Self-loops", value: "0%", sub: "éliminés par masking" },
];

export default function DemoSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]">
        <motion.circle cx="50%" cy="50%" r="180" fill="none" stroke={colors.blue} strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2 }} />
        <motion.circle cx="50%" cy="50%" r="280" fill="none" stroke={colors.purple} strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2.5, delay: 0.3 }} />
        <motion.circle cx="50%" cy="50%" r="380" fill="none" stroke={colors.cyan} strokeWidth="0.3"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 3, delay: 0.5 }} />
      </svg>

      <motion.h2 variants={fadeUp}
        className="text-5xl font-bold mb-4 text-glow-cyan z-10" style={{ color: colors.cyan }}>
        Démo en direct
      </motion.h2>
      <motion.p variants={fadeUp} className="text-lg mb-10 z-10" style={{ color: colors.grayLight }}>
        {"De la courbe d'impédance au circuit en temps réel"}
      </motion.p>

      {/* Stats */}
      <motion.div className="grid grid-cols-4 gap-4 mb-10 z-10" variants={staggerContainer}>
        {stats.map((s) => (
          <motion.div key={s.label} variants={scaleIn}
            className="flex flex-col items-center p-4 rounded-xl border"
            style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
            <div className="text-2xl font-bold font-mono" style={{ color: colors.blue }}>{s.value}</div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: colors.white }}>{s.label}</div>
            <div className="text-[10px]" style={{ color: colors.gray }}>{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div variants={scaleIn}
        className="relative px-8 py-4 rounded-2xl border z-10"
        style={{ borderColor: `${colors.blue}50`, background: `linear-gradient(135deg, ${colors.blue}12, ${colors.purple}08)` }}>
        <motion.div animate={pulse}>
          <span className="text-lg font-semibold" style={{ color: colors.white }}>→ Lancer la démo interactive</span>
        </motion.div>
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 25px ${colors.blue}25` }}
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
      </motion.div>
    </motion.div>
  );
}
