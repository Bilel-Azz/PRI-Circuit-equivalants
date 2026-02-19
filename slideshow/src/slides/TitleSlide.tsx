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
  { label: "150k Samples", color: colors.purple },
];

export default function TitleSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative circuit lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <motion.line
          x1="10%" y1="30%" x2="40%" y2="30%"
          stroke={colors.blue} strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.line
          x1="60%" y1="70%" x2="90%" y2="70%"
          stroke={colors.cyan} strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
        <motion.circle
          cx="40%" cy="30%" r="4"
          fill={colors.blue}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 2.5, type: "spring" }}
        />
        <motion.circle
          cx="60%" cy="70%" r="4"
          fill={colors.cyan}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 2.8, type: "spring" }}
        />
      </svg>

      {/* Main title */}
      <motion.div variants={fadeUp} className="text-center z-10">
        <motion.h1
          className="text-7xl font-bold tracking-tight mb-2"
          style={{ color: colors.white }}
        >
          Circuit Synthesis
        </motion.h1>
        <motion.h1
          className="text-7xl font-bold tracking-tight text-glow-blue"
          style={{ color: colors.blue }}
          variants={fadeUp}
        >
          AI
        </motion.h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        variants={fadeUp}
        className="text-xl mt-6 font-light tracking-wide z-10"
        style={{ color: colors.grayLight }}
      >
        Impedance Z(f) &rarr; Circuit Topology
      </motion.p>

      {/* Separator line */}
      <motion.div
        className="w-24 h-[2px] mt-8 mb-8 z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.blue}, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />

      {/* Tech tags */}
      <motion.div
        className="flex flex-wrap gap-3 justify-center z-10"
        variants={staggerFast}
      >
        {tags.map((tag) => (
          <motion.span
            key={tag.label}
            variants={scaleIn}
            className="px-4 py-1.5 rounded-full text-sm font-mono border"
            style={{
              borderColor: `${tag.color}40`,
              color: tag.color,
              background: `${tag.color}10`,
            }}
          >
            {tag.label}
          </motion.span>
        ))}
      </motion.div>

      {/* Author / context */}
      <motion.p
        variants={fadeUp}
        className="absolute bottom-16 text-sm font-light z-10"
        style={{ color: colors.gray }}
      >
        Projet de fin d&apos;ann&eacute;e &mdash; Synth&egrave;se de circuits &eacute;lectriques par IA
      </motion.p>
    </motion.div>
  );
}
