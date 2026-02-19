"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const leftPhases = [
  { label: "Spécifications", y: 60 },
  { label: "Conception", y: 120 },
  { label: "Réalisation", y: 180 },
];

const rightPhases = [
  { label: "Validation", y: 60 },
  { label: "Intégration", y: 120 },
  { label: "Tests unitaires", y: 180 },
];

export default function MethodologieSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>
          02 — Méthodologie
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Cycle en V
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        Adapté au projet individuel avec cahier des charges fixe
      </motion.p>

      {/* V-Cycle SVG */}
      <motion.div variants={fadeUp} className="relative" style={{ width: 700, height: 280 }}>
        <svg width="700" height="280" viewBox="0 0 700 280">
          {/* V shape lines */}
          <motion.line x1="80" y1="30" x2="350" y2="250" stroke={colors.blue} strokeWidth="2" strokeDasharray="6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 1 }} />
          <motion.line x1="350" y1="250" x2="620" y2="30" stroke={colors.green} strokeWidth="2" strokeDasharray="6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 1 }} />

          {/* Horizontal traceability arrows */}
          {[0, 1, 2].map((i) => (
            <motion.line key={i}
              x1={160 + i * 60} y1={60 + i * 60}
              x2={540 - i * 60} y2={60 + i * 60}
              stroke={colors.grayDark} strokeWidth="1" strokeDasharray="4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 2 + i * 0.2, duration: 0.5 }}
            />
          ))}

          {/* Left side nodes (descending) */}
          {leftPhases.map((phase, i) => (
            <motion.g key={phase.label}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.25, type: "spring" }}>
              <rect x={30 + i * 50} y={phase.y - 14} width={120} height={28} rx="6"
                fill={`${colors.blue}15`} stroke={colors.blue} strokeWidth="1" />
              <text x={90 + i * 50} y={phase.y + 4} textAnchor="middle"
                fill={colors.blue} fontSize="11" fontFamily="system-ui">{phase.label}</text>
            </motion.g>
          ))}

          {/* Bottom node */}
          <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}>
            <rect x={290} y={236} width={120} height={28} rx="6"
              fill={`${colors.purple}20`} stroke={colors.purple} strokeWidth="1.5" />
            <text x={350} y={254} textAnchor="middle"
              fill={colors.purple} fontSize="11" fontWeight="bold" fontFamily="system-ui">{"Réalisation"}</text>
          </motion.g>

          {/* Right side nodes (ascending) */}
          {rightPhases.map((phase, i) => (
            <motion.g key={phase.label}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + i * 0.25, type: "spring" }}>
              <rect x={550 - i * 50} y={phase.y - 14} width={120} height={28} rx="6"
                fill={`${colors.green}15`} stroke={colors.green} strokeWidth="1" />
              <text x={610 - i * 50} y={phase.y + 4} textAnchor="middle"
                fill={colors.green} fontSize="11" fontFamily="system-ui">{phase.label}</text>
            </motion.g>
          ))}
        </svg>
      </motion.div>

      {/* Justification */}
      <motion.div className="flex gap-4 mt-6" variants={staggerContainer}>
        {[
          { reason: "Projet individuel", detail: "Scrum = équipe 3-9 pers." },
          { reason: "CdC fixe", detail: "Pas d'itérations client" },
          { reason: "Traçabilité", detail: "Spécif ↔ Tests" },
        ].map((r) => (
          <motion.div key={r.reason} variants={fadeUp}
            className="px-4 py-2 rounded-lg border text-center"
            style={{ borderColor: colors.border }}>
            <div className="text-xs font-semibold" style={{ color: colors.white }}>{r.reason}</div>
            <div className="text-[10px] mt-0.5" style={{ color: colors.gray }}>{r.detail}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
