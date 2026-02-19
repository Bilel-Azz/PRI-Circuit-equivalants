"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

/* Mini circuit schematic for visual */
function MiniCircuit() {
  return (
    <svg viewBox="0 0 100 60" className="w-28 h-16">
      {/* IN dot */}
      <circle cx="5" cy="20" r="2" fill={colors.cyan} />
      <text x="5" y="14" textAnchor="middle" fill={colors.cyan} fontSize="5" fontFamily="monospace">IN</text>
      {/* R */}
      <line x1="7" y1="20" x2="18" y2="20" stroke={colors.grayDark} strokeWidth="0.8" />
      <rect x="18" y="14" width="18" height="12" rx="2.5" fill={`${colors.resistor}25`} stroke={colors.resistor} strokeWidth="0.7" />
      <text x="27" y="23" textAnchor="middle" fill={colors.resistor} fontSize="6" fontWeight="bold" fontFamily="monospace">R</text>
      {/* L */}
      <line x1="36" y1="20" x2="46" y2="20" stroke={colors.grayDark} strokeWidth="0.8" />
      <rect x="46" y="14" width="18" height="12" rx="2.5" fill={`${colors.inductor}25`} stroke={colors.inductor} strokeWidth="0.7" />
      <text x="55" y="23" textAnchor="middle" fill={colors.inductor} fontSize="6" fontWeight="bold" fontFamily="monospace">L</text>
      {/* C */}
      <line x1="64" y1="20" x2="74" y2="20" stroke={colors.grayDark} strokeWidth="0.8" />
      <rect x="74" y="14" width="18" height="12" rx="2.5" fill={`${colors.capacitor}25`} stroke={colors.capacitor} strokeWidth="0.7" />
      <text x="83" y="23" textAnchor="middle" fill={colors.capacitor} fontSize="6" fontWeight="bold" fontFamily="monospace">C</text>
      {/* GND */}
      <line x1="92" y1="20" x2="98" y2="20" stroke={colors.grayDark} strokeWidth="0.8" />
      <line x1="98" y1="20" x2="98" y2="24" stroke={colors.grayDark} strokeWidth="0.8" />
      <line x1="94" y1="24" x2="102" y2="24" stroke={colors.grayDark} strokeWidth="0.6" />
      <line x1="95.5" y1="26" x2="100.5" y2="26" stroke={colors.grayDark} strokeWidth="0.5" />
      <line x1="97" y1="28" x2="99" y2="28" stroke={colors.grayDark} strokeWidth="0.4" />
      {/* Node labels */}
      <text x="5" y="32" fill={colors.gray} fontSize="4" fontFamily="monospace">n0</text>
      <text x="40" y="32" fill={colors.gray} fontSize="4" fontFamily="monospace">n1</text>
      <text x="68" y="32" fill={colors.gray} fontSize="4" fontFamily="monospace">n2</text>
      <text x="98" y="36" fill={colors.gray} fontSize="4" textAnchor="middle" fontFamily="monospace">GND</text>
    </svg>
  );
}

/* 8x8 matrix visual showing mostly zeros */
const matrixData = [
  [0, "R", 0, 0, 0, 0, 0, 0],
  ["R", 0, "L", 0, 0, 0, 0, 0],
  [0, "L", 0, "C", 0, 0, 0, 0],
  [0, 0, "C", 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export default function RepresentationSlide() {
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
          style={{ background: `${colors.green}15`, color: colors.green }}
        >
          03 — Représentation
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Représenter un circuit
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-8"
        style={{ color: colors.grayLight }}
      >
        Comment encoder un circuit pour un réseau de neurones ?
      </motion.p>

      <div className="flex gap-8 items-center w-full max-w-5xl">
        {/* Left: The problem */}
        <motion.div variants={scaleIn} className="flex-1">
          <div className="text-sm font-mono mb-3" style={{ color: colors.cyan }}>
            Le problème
          </div>
          <div className="text-xs mb-4" style={{ color: colors.grayLight }}>
            {"Un circuit = un graphe (nœuds + arêtes). Un réseau de neurones attend des nombres en entrée."}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <MiniCircuit />
            <span className="text-lg" style={{ color: colors.grayDark }}>→</span>
            <span className="text-2xl" style={{ color: colors.blue }}>?</span>
          </div>
        </motion.div>

        {/* Center: Arrow */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-xs font-mono mb-1" style={{ color: colors.gray }}>1ère idée</div>
          <svg width="60" height="20">
            <line x1="0" y1="10" x2="45" y2="10" stroke={colors.grayDark} strokeWidth="1.5" />
            <polygon points="43,5 55,10 43,15" fill={colors.grayDark} />
          </svg>
        </motion.div>

        {/* Right: Matrix approach */}
        <motion.div
          className="flex-1 p-5 rounded-2xl border"
          style={{ borderColor: `${colors.resistor}25`, background: `${colors.resistor}05` }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, type: "spring" }}
        >
          <div className="text-sm font-mono mb-2" style={{ color: colors.resistor }}>
            Matrice d{"'"}adjacence 8×8
          </div>

          {/* Matrix grid */}
          <div className="flex justify-center mb-3">
            <div className="grid grid-cols-8 gap-0.5">
              {matrixData.flat().map((cell, i) => {
                const isComp = typeof cell === "string";
                const cellColor = cell === "R" ? colors.resistor : cell === "L" ? colors.inductor : cell === "C" ? colors.capacitor : undefined;
                return (
                  <motion.div
                    key={i}
                    className="w-6 h-6 flex items-center justify-center text-[8px] font-mono rounded-sm"
                    style={{
                      background: isComp ? `${cellColor}25` : `${colors.grayDark}30`,
                      color: isComp ? cellColor : `${colors.grayDark}80`,
                      border: isComp ? `1px solid ${cellColor}50` : "none",
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.01 }}
                  >
                    {cell === 0 ? "0" : cell}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Problems */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[10px]" style={{ color: colors.resistor }}>
              <span>✗</span>
              <span>90% de zéros — matrice creuse et inefficace</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: colors.resistor }}>
              <span>✗</span>
              <span>48% accuracy seulement</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: colors.resistor }}>
              <span>✗</span>
              <span>Perd {"l'"}information de valeur des composants</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transition to next slide */}
      <motion.div
        className="mt-8 px-5 py-3 rounded-xl border"
        style={{ borderColor: `${colors.cyan}30`, background: `${colors.cyan}08` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-sm" style={{ color: colors.cyan }}>
          {"Il faut une représentation plus compacte → "}
          <span className="font-bold">tokens séquentiels</span>
        </span>
      </motion.div>
    </motion.div>
  );
}
