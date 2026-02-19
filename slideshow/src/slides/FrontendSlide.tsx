"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

export default function FrontendSlide() {
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
        Architecture Compl&egrave;te
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-lg mb-12"
        style={{ color: colors.grayLight }}
      >
        Frontend Next.js &harr; Backend FastAPI
      </motion.p>

      <div className="flex items-center gap-6">
        {/* Frontend */}
        <motion.div
          variants={scaleIn}
          className="flex flex-col p-6 rounded-2xl border relative"
          style={{
            borderColor: `${colors.white}20`,
            background: `${colors.bgCard}ee`,
            width: 280,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-2 text-xs font-mono" style={{ color: colors.gray }}>
              localhost:3000
            </span>
          </div>

          {/* Mock UI */}
          <motion.div
            className="rounded-lg p-3 mb-3"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-xs font-mono mb-2" style={{ color: colors.grayLight }}>
              Circuit Visualizer
            </div>
            <svg width="230" height="60" viewBox="0 0 230 60">
              {/* Mock circuit schematic */}
              <motion.line x1="10" y1="30" x2="50" y2="30" stroke={colors.grayDark} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.3 }} />
              <motion.rect x="50" y="20" width="40" height="20" rx="3" fill={`${colors.resistor}30`} stroke={colors.resistor} strokeWidth="1"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }} />
              <motion.text x="62" y="34" fill={colors.resistor} fontSize="10" fontFamily="monospace"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>R</motion.text>
              <motion.line x1="90" y1="30" x2="120" y2="30" stroke={colors.grayDark} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 0.3 }} />
              <motion.rect x="120" y="20" width="40" height="20" rx="3" fill={`${colors.inductor}30`} stroke={colors.inductor} strokeWidth="1"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }} />
              <motion.text x="132" y="34" fill={colors.inductor} fontSize="10" fontFamily="monospace"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>L</motion.text>
              <motion.line x1="160" y1="30" x2="220" y2="30" stroke={colors.grayDark} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: 0.3 }} />
            </svg>
          </motion.div>

          {/* Features */}
          <motion.div variants={staggerFast} className="flex flex-col gap-1.5 mt-2">
            {[
              { icon: "\u{1F4C8}", label: "Graphiques interactifs" },
              { icon: "\u{1F50D}", label: "Exploration des candidats" },
              { icon: "\u{1F527}", label: "R\u00E9paration de circuits" },
            ].map((feat) => (
              <motion.div
                key={feat.label}
                variants={fadeUp}
                className="flex items-center gap-2 text-xs"
                style={{ color: colors.grayLight }}
              >
                <span>{feat.icon}</span>
                <span>{feat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-4 text-xs font-mono" style={{ color: colors.blue }}>
            Next.js + React + Tailwind
          </div>
        </motion.div>

        {/* Bidirectional data flow */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {/* Forward arrow */}
          <div className="relative">
            <svg width="120" height="30">
              <motion.line x1="10" y1="15" x2="100" y2="15" stroke={colors.cyan} strokeWidth="1.5" strokeDasharray="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.6 }} />
              <motion.polygon points="96,10 108,15 96,20" fill={colors.cyan}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} />
            </svg>
            {/* Flowing dots */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-[11px] w-2 h-2 rounded-full"
                style={{ background: colors.cyan, left: 10 }}
                animate={{ x: [0, 90], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 2 + i * 0.5,
                  ease: "linear",
                }}
              />
            ))}
            <div className="text-[10px] font-mono text-center mt-0.5" style={{ color: colors.cyan }}>
              Z(f) data
            </div>
          </div>

          {/* Return arrow */}
          <div className="relative">
            <svg width="120" height="30">
              <motion.line x1="100" y1="15" x2="10" y2="15" stroke={colors.green} strokeWidth="1.5" strokeDasharray="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6, duration: 0.6 }} />
              <motion.polygon points="14,10 2,15 14,20" fill={colors.green}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} />
            </svg>
            {/* Flowing dots */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-[11px] w-2 h-2 rounded-full"
                style={{ background: colors.green, left: 100 }}
                animate={{ x: [0, -90], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 2.3 + i * 0.5,
                  ease: "linear",
                }}
              />
            ))}
            <div className="text-[10px] font-mono text-center mt-0.5" style={{ color: colors.green }}>
              circuit result
            </div>
          </div>
        </motion.div>

        {/* Backend */}
        <motion.div
          variants={scaleIn}
          className="flex flex-col p-6 rounded-2xl border"
          style={{
            borderColor: `${colors.green}30`,
            background: `${colors.green}08`,
            width: 280,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ background: colors.green }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-bold" style={{ color: colors.green }}>
              FastAPI
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full ml-auto" style={{ background: `${colors.green}15`, color: colors.green }}>
              :8000
            </span>
          </div>

          {/* Stack */}
          <motion.div variants={staggerFast} className="flex flex-col gap-2">
            {[
              { label: "Inference Engine", desc: "PyTorch model", color: colors.blue },
              { label: "MNA Solver", desc: "Impedance calculation", color: colors.cyan },
              { label: "Circuit Validator", desc: "Topology checks", color: colors.yellow },
              { label: "Repair Engine", desc: "Auto-fix invalid", color: colors.orange },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="w-1.5 h-6 rounded-full"
                  style={{ background: item.color }}
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: colors.white }}>
                    {item.label}
                  </div>
                  <div className="text-[10px]" style={{ color: colors.gray }}>
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
