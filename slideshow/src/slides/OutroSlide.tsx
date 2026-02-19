"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, pulse } from "@/lib/animations";
import { colors } from "@/lib/theme";

const stats = [
  { label: "Dataset", value: "150k", sub: "circuits synth\u00E9tiques" },
  { label: "Accuracy", value: "99.8%", sub: "type prediction" },
  { label: "Latence", value: "<50ms", sub: "inf\u00E9rence GPU" },
  { label: "Self-loops", value: "0%", sub: "\u00E9limin\u00E9s" },
];

export default function OutroSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative SVG rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <motion.circle
          cx="50%" cy="50%" r="200"
          fill="none" stroke={colors.blue} strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
        />
        <motion.circle
          cx="50%" cy="50%" r="300"
          fill="none" stroke={colors.purple} strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.5 }}
        />
        <motion.circle
          cx="50%" cy="50%" r="400"
          fill="none" stroke={colors.cyan} strokeWidth="0.3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 3, delay: 0.7 }}
        />
      </svg>

      <motion.h2
        variants={fadeUp}
        className="text-6xl font-bold mb-4 text-glow-cyan z-10"
        style={{ color: colors.cyan }}
      >
        D&eacute;mo en action...
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="text-xl mb-12 z-10"
        style={{ color: colors.grayLight }}
      >
        De la courbe d&apos;imp&eacute;dance au circuit en temps r&eacute;el
      </motion.p>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-4 gap-5 mb-12 z-10"
        variants={staggerContainer}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={scaleIn}
            className="flex flex-col items-center p-5 rounded-xl border"
            style={{
              borderColor: colors.border,
              background: `${colors.bgCard}cc`,
            }}
          >
            <div className="text-3xl font-bold font-mono" style={{ color: colors.blue }}>
              {stat.value}
            </div>
            <div className="text-sm font-semibold mt-1" style={{ color: colors.white }}>
              {stat.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: colors.gray }}>
              {stat.sub}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={scaleIn}
        className="relative px-8 py-4 rounded-2xl border z-10"
        style={{
          borderColor: `${colors.blue}50`,
          background: `linear-gradient(135deg, ${colors.blue}15, ${colors.purple}10)`,
        }}
      >
        <motion.div animate={pulse}>
          <span className="text-lg font-semibold" style={{ color: colors.white }}>
            &rarr; &nbsp;Lancer la d&eacute;mo interactive
          </span>
        </motion.div>
        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 30px ${colors.blue}30` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Credits */}
      <motion.div
        className="absolute bottom-16 flex flex-col items-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="text-sm" style={{ color: colors.gray }}>
          Projet de fin d&apos;ann&eacute;e &mdash; Circuit Synthesis AI
        </div>
        <div className="text-xs mt-1 font-mono" style={{ color: colors.grayDark }}>
          PyTorch &bull; FastAPI &bull; Next.js &bull; 100% synth&eacute;tique
        </div>
      </motion.div>
    </motion.div>
  );
}
