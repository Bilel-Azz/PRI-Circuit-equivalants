"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const tags = [
  { label: "PyTorch", color: colors.orange },
  { label: "CNN + Transformer", color: colors.blue },
  { label: "Next.js", color: colors.white },
  { label: "FastAPI", color: colors.green },
  { label: "MNA Solver", color: colors.cyan },
];

export default function TitleSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative circuit traces */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
        <motion.line x1="5%" y1="25%" x2="35%" y2="25%" stroke={colors.blue} strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5 }} />
        <motion.line x1="65%" y1="75%" x2="95%" y2="75%" stroke={colors.cyan} strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.8 }} />
        <motion.circle cx="35%" cy="25%" r="3" fill={colors.blue}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: "spring" }} />
        <motion.circle cx="65%" cy="75%" r="3" fill={colors.cyan}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.8, type: "spring" }} />
      </svg>

      {/* PRI badge */}
      <motion.div
        variants={fadeUp}
        className="absolute top-8 left-10 flex items-center gap-3 z-10"
      >
        <span className="text-xs font-mono px-3 py-1 rounded-full border"
          style={{ borderColor: `${colors.blue}40`, color: colors.blue, background: `${colors.blue}10` }}>
          PRI 5A — Polytech Tours
        </span>
        <span className="text-xs font-mono" style={{ color: colors.gray }}>
          2025-2026
        </span>
      </motion.div>

      {/* Main title */}
      <motion.div variants={fadeUp} className="text-center z-10">
        <motion.h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: colors.white }}>
          Synthèse de circuits
        </motion.h1>
        <motion.h1
          className="text-5xl font-bold tracking-tight text-glow-blue"
          style={{ color: colors.blue }}
          variants={fadeUp}
        >
          équivalents par IA
        </motion.h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p variants={fadeUp} className="text-xl mt-6 font-light tracking-wide z-10" style={{ color: colors.grayLight }}>
        {"Courbe d'imp\u00e9dance Z(f) \u2192 Circuit RLC \u00e9quivalent"}
      </motion.p>

      {/* Separator */}
      <motion.div
        className="w-24 h-[2px] mt-8 mb-8 z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.blue}, transparent)` }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
      />

      {/* Tech tags */}
      <motion.div className="flex flex-wrap gap-3 justify-center z-10" variants={staggerFast}>
        {tags.map((tag) => (
          <motion.span key={tag.label} variants={scaleIn}
            className="px-4 py-1.5 rounded-full text-sm font-mono border"
            style={{ borderColor: `${tag.color}40`, color: tag.color, background: `${tag.color}10` }}>
            {tag.label}
          </motion.span>
        ))}
      </motion.div>

      {/* Author + encadrant */}
      <motion.div variants={fadeUp} className="absolute bottom-12 flex flex-col items-center z-10">
        <div className="text-sm font-medium" style={{ color: colors.white }}>Bilel AAZZOUZ</div>
        <div className="text-xs mt-1" style={{ color: colors.grayLight }}>
          {"Encadrants : Fr\u00e9d\u00e9ric Rayar, Yannick Kergossien & Isma\u00efl Aouichak"}
        </div>
      </motion.div>
    </motion.div>
  );
}
