"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

const components = [
  {
    letter: "R",
    name: "Résistance",
    desc: "Freine le courant",
    formula: "Z = R",
    formulaSub: "constant",
    color: colors.resistor,
    // Zigzag resistor symbol
    path: "M 0,20 L 8,20 L 12,6 L 20,34 L 28,6 L 36,34 L 44,6 L 48,20 L 56,20",
    viewBox: "0 0 56 40",
  },
  {
    letter: "L",
    name: "Inductance (bobine)",
    desc: "Stocke l'énergie magnétique",
    formula: "Z = jωL",
    formulaSub: "↑ avec la fréquence",
    color: colors.inductor,
    // Coil inductor symbol
    path: "M 0,22 L 6,22 C 10,22 10,6 14,6 C 18,6 18,22 22,22 C 26,22 26,6 30,6 C 34,6 34,22 38,22 C 42,22 42,6 46,6 C 50,6 50,22 54,22 L 60,22",
    viewBox: "0 0 60 30",
  },
  {
    letter: "C",
    name: "Capacité (condensateur)",
    desc: "Stocke l'énergie électrique",
    formula: "Z = 1/jωC",
    formulaSub: "↓ avec la fréquence",
    color: colors.capacitor,
    // Capacitor: two plates
    path: "M 0,18 L 20,18 M 20,4 L 20,32 M 28,4 L 28,32 M 28,18 L 48,18",
    viewBox: "0 0 48 36",
  },
];

export default function ContexteSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{ background: `${colors.blue}15`, color: colors.blue }}
        >
          01 — Circuits RLC
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        {"Qu'est-ce qu'un circuit RLC ?"}
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-8"
        style={{ color: colors.grayLight }}
      >
        {"Les 3 briques de base de l'électronique"}
      </motion.p>

      {/* 3 component cards */}
      <div className="flex gap-5 w-full max-w-5xl mb-8">
        {components.map((comp, i) => (
          <motion.div
            key={comp.letter}
            className="flex-1 p-5 rounded-2xl border flex flex-col items-center"
            style={{
              borderColor: `${comp.color}30`,
              background: `${comp.color}06`,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.2, type: "spring", stiffness: 120 }}
          >
            {/* SVG symbol */}
            <svg
              viewBox={comp.viewBox}
              className="w-24 h-12 mb-3"
              fill="none"
            >
              <motion.path
                d={comp.path}
                stroke={comp.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.2, duration: 1, ease: "easeInOut" }}
              />
            </svg>

            {/* Name */}
            <div className="text-base font-bold mb-1" style={{ color: comp.color }}>
              {comp.letter} — {comp.name}
            </div>

            {/* Description */}
            <div className="text-xs mb-3 text-center" style={{ color: colors.grayLight }}>
              {comp.desc}
            </div>

            {/* Formula */}
            <div
              className="px-3 py-1.5 rounded-lg text-center"
              style={{ background: `${comp.color}15` }}
            >
              <div className="text-sm font-mono font-bold" style={{ color: comp.color }}>
                {comp.formula}
              </div>
              <div className="text-[10px]" style={{ color: colors.gray }}>
                {comp.formulaSub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Assembly section */}
      <motion.div
        className="flex gap-6 w-full max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, type: "spring" }}
      >
        <div
          className="text-xs font-mono py-2 px-3 rounded-lg self-center"
          style={{ color: colors.grayLight, background: `${colors.border}80` }}
        >
          Assemblage
        </div>

        {/* Série */}
        <div
          className="flex-1 flex items-center gap-4 p-3 rounded-xl border"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        >
          <div>
            <div className="text-sm font-bold mb-1" style={{ color: colors.cyan }}>
              Série
            </div>
            <svg viewBox="0 0 130 30" className="w-32 h-7">
              <line x1="0" y1="15" x2="15" y2="15" stroke={colors.grayDark} strokeWidth="1" />
              <rect x="15" y="8" width="22" height="14" rx="3" fill={`${colors.resistor}25`} stroke={colors.resistor} strokeWidth="0.8" />
              <text x="26" y="18" textAnchor="middle" fill={colors.resistor} fontSize="7" fontWeight="bold" fontFamily="monospace">R</text>
              <line x1="37" y1="15" x2="48" y2="15" stroke={colors.grayDark} strokeWidth="1" />
              <rect x="48" y="8" width="22" height="14" rx="3" fill={`${colors.inductor}25`} stroke={colors.inductor} strokeWidth="0.8" />
              <text x="59" y="18" textAnchor="middle" fill={colors.inductor} fontSize="7" fontWeight="bold" fontFamily="monospace">L</text>
              <line x1="70" y1="15" x2="81" y2="15" stroke={colors.grayDark} strokeWidth="1" />
              <rect x="81" y="8" width="22" height="14" rx="3" fill={`${colors.capacitor}25`} stroke={colors.capacitor} strokeWidth="0.8" />
              <text x="92" y="18" textAnchor="middle" fill={colors.capacitor} fontSize="7" fontWeight="bold" fontFamily="monospace">C</text>
              <line x1="103" y1="15" x2="130" y2="15" stroke={colors.grayDark} strokeWidth="1" />
            </svg>
          </div>
          <div className="text-xs font-mono" style={{ color: colors.grayLight }}>
            Z = Z₁ + Z₂ + Z₃
          </div>
        </div>

        {/* Parallèle */}
        <div
          className="flex-1 flex items-center gap-4 p-3 rounded-xl border"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        >
          <div>
            <div className="text-sm font-bold mb-1" style={{ color: colors.orange }}>
              Parallèle
            </div>
            <svg viewBox="0 0 110 50" className="w-28 h-12">
              {/* Left wire */}
              <line x1="0" y1="25" x2="20" y2="25" stroke={colors.grayDark} strokeWidth="1" />
              {/* Split */}
              <line x1="20" y1="25" x2="20" y2="10" stroke={colors.grayDark} strokeWidth="1" />
              <line x1="20" y1="25" x2="20" y2="40" stroke={colors.grayDark} strokeWidth="1" />
              {/* Top branch: L */}
              <line x1="20" y1="10" x2="35" y2="10" stroke={colors.grayDark} strokeWidth="1" />
              <rect x="35" y="3" width="22" height="14" rx="3" fill={`${colors.inductor}25`} stroke={colors.inductor} strokeWidth="0.8" />
              <text x="46" y="13" textAnchor="middle" fill={colors.inductor} fontSize="7" fontWeight="bold" fontFamily="monospace">L</text>
              <line x1="57" y1="10" x2="75" y2="10" stroke={colors.grayDark} strokeWidth="1" />
              {/* Bottom branch: C */}
              <line x1="20" y1="40" x2="35" y2="40" stroke={colors.grayDark} strokeWidth="1" />
              <rect x="35" y="33" width="22" height="14" rx="3" fill={`${colors.capacitor}25`} stroke={colors.capacitor} strokeWidth="0.8" />
              <text x="46" y="43" textAnchor="middle" fill={colors.capacitor} fontSize="7" fontWeight="bold" fontFamily="monospace">C</text>
              <line x1="57" y1="40" x2="75" y2="40" stroke={colors.grayDark} strokeWidth="1" />
              {/* Merge */}
              <line x1="75" y1="10" x2="75" y2="40" stroke={colors.grayDark} strokeWidth="1" />
              <line x1="75" y1="25" x2="110" y2="25" stroke={colors.grayDark} strokeWidth="1" />
            </svg>
          </div>
          <div className="text-xs font-mono" style={{ color: colors.grayLight }}>
            1/Z = 1/Z₁ + 1/Z₂
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
