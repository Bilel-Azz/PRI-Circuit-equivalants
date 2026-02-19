"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

export default function MerciSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative traces */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]">
        {[20, 40, 60, 80].map((y) => (
          <motion.line key={y} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`}
            stroke={colors.blue} strokeWidth="0.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: y * 0.02, duration: 2 }} />
        ))}
      </svg>

      <motion.h2 variants={fadeUp}
        className="text-6xl font-bold mb-4 z-10" style={{ color: colors.white }}>
        Merci
      </motion.h2>

      <motion.div
        className="w-16 h-[2px] mb-8 z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.blue}, transparent)` }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
      />

      <motion.p variants={fadeUp}
        className="text-2xl font-light mb-12 z-10" style={{ color: colors.grayLight }}>
        Questions ?
      </motion.p>

      {/* Contact info */}
      <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 z-10">
        <div className="text-base font-medium" style={{ color: colors.white }}>Bilel AAZZOUZ</div>
        <div className="text-sm" style={{ color: colors.grayLight }}>PRI 5A — Polytech Tours — 2025-2026</div>
        <div className="text-xs mt-1" style={{ color: colors.grayLight }}>
          Encadrants : Frédéric Rayar & Yannick Kergossien
        </div>
      </motion.div>

      {/* Tech footer */}
      <motion.div
        className="absolute bottom-12 flex gap-3 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {["PyTorch", "FastAPI", "Next.js", "Python"].map((t) => (
          <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
            style={{ borderColor: colors.border, color: colors.gray }}>
            {t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
