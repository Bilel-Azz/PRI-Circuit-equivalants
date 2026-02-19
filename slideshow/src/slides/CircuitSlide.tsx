"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerSlow, floatY } from "@/lib/animations";
import { colors } from "@/lib/theme";

const components = [
  {
    type: "R",
    label: "Resistance",
    value: "100 \u03A9",
    color: colors.resistor,
    desc: "Dissipation d'\u00E9nergie",
    symbol: (
      <svg viewBox="0 0 80 40" className="w-20 h-10">
        <motion.path
          d="M0,20 L10,20 L15,5 L25,35 L35,5 L45,35 L55,5 L65,35 L70,20 L80,20"
          fill="none"
          stroke={colors.resistor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </svg>
    ),
  },
  {
    type: "L",
    label: "Inductance",
    value: "10 mH",
    color: colors.inductor,
    desc: "Stockage magn\u00E9tique",
    symbol: (
      <svg viewBox="0 0 80 40" className="w-20 h-10">
        <motion.path
          d="M0,30 L10,30 Q15,30 15,20 Q15,10 20,10 Q25,10 25,20 Q25,30 30,30 Q30,30 30,20 Q30,10 35,10 Q40,10 40,20 Q40,30 45,30 Q45,30 45,20 Q45,10 50,10 Q55,10 55,20 Q55,30 60,30 L70,30 L80,30"
          fill="none"
          stroke={colors.inductor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </svg>
    ),
  },
  {
    type: "C",
    label: "Capacitance",
    value: "1 \u00B5F",
    color: colors.capacitor,
    desc: "Stockage \u00E9lectrique",
    symbol: (
      <svg viewBox="0 0 80 40" className="w-20 h-10">
        <motion.line
          x1="0" y1="20" x2="34" y2="20"
          stroke={colors.capacitor} strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        />
        <motion.line
          x1="34" y1="5" x2="34" y2="35"
          stroke={colors.capacitor} strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        />
        <motion.line
          x1="46" y1="5" x2="46" y2="35"
          stroke={colors.capacitor} strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.3 }}
        />
        <motion.line
          x1="46" y1="20" x2="80" y2="20"
          stroke={colors.capacitor} strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        />
      </svg>
    ),
  },
];

export default function CircuitSlide() {
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
        Composants R, L, C
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-lg mb-12"
        style={{ color: colors.grayLight }}
      >
        Les briques fondamentales des circuits &eacute;lectriques
      </motion.p>

      <motion.div
        className="flex gap-8"
        variants={staggerSlow}
      >
        {components.map((comp) => (
          <motion.div
            key={comp.type}
            variants={scaleIn}
            className="flex flex-col items-center p-8 rounded-2xl border backdrop-blur-sm"
            style={{
              borderColor: `${comp.color}30`,
              background: `linear-gradient(135deg, ${comp.color}08, ${comp.color}03)`,
              width: 240,
            }}
            whileHover={{ y: -4, borderColor: `${comp.color}60` }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Component type badge */}
            <motion.div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold mb-4"
              style={{
                background: `${comp.color}20`,
                color: comp.color,
                boxShadow: `0 0 20px ${comp.color}20`,
              }}
              animate={floatY}
            >
              {comp.type}
            </motion.div>

            {/* Symbol SVG */}
            <div className="my-4">{comp.symbol}</div>

            {/* Label */}
            <div className="text-lg font-semibold mt-2" style={{ color: comp.color }}>
              {comp.label}
            </div>
            <div className="text-sm font-mono mt-1" style={{ color: colors.grayLight }}>
              {comp.value}
            </div>
            <div className="text-xs mt-2" style={{ color: colors.gray }}>
              {comp.desc}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Connection dots */}
      <motion.div
        className="flex items-center gap-4 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        {[colors.resistor, colors.inductor, colors.capacitor].map((c, i) => (
          <motion.div key={i} className="flex items-center gap-4">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ background: c, boxShadow: `0 0 10px ${c}` }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
            {i < 2 && (
              <motion.div
                className="w-16 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${c}, ${[colors.resistor, colors.inductor, colors.capacitor][i + 1]})` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2 + i * 0.2, duration: 0.5 }}
              />
            )}
          </motion.div>
        ))}
        <motion.span
          className="ml-4 text-sm font-mono"
          style={{ color: colors.grayLight }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          S&eacute;rie / Parall&egrave;le
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
