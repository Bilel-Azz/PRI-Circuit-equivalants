"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, spin } from "@/lib/animations";
import { colors } from "@/lib/theme";

// Mini curve for input display
function miniCurvePath(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const x = t * 140;
    const y = 35 - 25 * Math.exp(-((t - 0.4) ** 2) / 0.01) + 3 * Math.sin(t * 20);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function AIPredictionSlide() {
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
        Pr&eacute;diction par IA
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-lg mb-12"
        style={{ color: colors.grayLight }}
      >
        Du signal vers la topologie
      </motion.p>

      {/* Pipeline: Input → AI → Output */}
      <div className="flex items-center gap-6">
        {/* Input box */}
        <motion.div
          variants={scaleIn}
          className="flex flex-col items-center p-5 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}40`, background: `${colors.cyan}08` }}
        >
          <div className="text-sm font-mono mb-3" style={{ color: colors.cyan }}>
            Input: Z(f)
          </div>
          <svg width="140" height="50" viewBox="0 0 140 50">
            <motion.path
              d={miniCurvePath()}
              fill="none"
              stroke={colors.cyan}
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
          </svg>
          <div className="text-xs font-mono mt-2" style={{ color: colors.gray }}>
            (2, 100) tensor
          </div>
        </motion.div>

        {/* Arrow 1 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <svg width="60" height="20">
            <motion.line
              x1="0" y1="10" x2="50" y2="10"
              stroke={colors.blue} strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            />
            <motion.polygon
              points="45,5 55,10 45,15"
              fill={colors.blue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            />
          </svg>
          {/* Data flow particles */}
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{ background: colors.cyan }}
            animate={{ x: [0, 60], opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 1.5 }}
          />
        </motion.div>

        {/* AI Box */}
        <motion.div
          variants={scaleIn}
          className="relative flex flex-col items-center p-8 rounded-2xl border"
          style={{
            borderColor: `${colors.blue}50`,
            background: `linear-gradient(135deg, ${colors.blue}15, ${colors.purple}10)`,
            minWidth: 220,
          }}
        >
          {/* Spinning gear */}
          <motion.svg
            width="50" height="50" viewBox="0 0 24 24"
            animate={spin}
            className="mb-3"
          >
            <path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              fill="none" stroke={colors.blue} strokeWidth="1.5"
            />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
              fill="none" stroke={colors.blue} strokeWidth="1.5"
            />
          </motion.svg>

          <div className="text-lg font-bold mb-1" style={{ color: colors.blue }}>
            Neural Network
          </div>
          <div className="text-xs font-mono" style={{ color: colors.grayLight }}>
            Encoder + 6 Heads
          </div>

          {/* Architecture detail */}
          <motion.div
            className="flex gap-1.5 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {[1024, 1024, 512].map((n, i) => (
              <motion.div
                key={i}
                className="flex flex-col gap-0.5 items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.15 }}
              >
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-2 h-2 rounded-full"
                    style={{ background: `${colors.blue}${60 + j * 15}` }}
                  />
                ))}
                <span className="text-[9px] font-mono mt-0.5" style={{ color: colors.gray }}>
                  {n}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: `1px solid ${colors.blue}` }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Arrow 2 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <svg width="60" height="20">
            <motion.line
              x1="0" y1="10" x2="50" y2="10"
              stroke={colors.green} strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
            />
            <motion.polygon
              points="45,5 55,10 45,15"
              fill={colors.green}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            />
          </svg>
        </motion.div>

        {/* Output box */}
        <motion.div
          variants={scaleIn}
          className="flex flex-col items-center p-5 rounded-2xl border"
          style={{ borderColor: `${colors.green}40`, background: `${colors.green}08` }}
        >
          <div className="text-sm font-mono mb-3" style={{ color: colors.green }}>
            Output: Circuit
          </div>
          {/* Predicted components */}
          <div className="flex gap-2 mb-2">
            {[
              { t: "R", c: colors.resistor },
              { t: "L", c: colors.inductor },
              { t: "C", c: colors.capacitor },
            ].map((comp, i) => (
              <motion.div
                key={comp.t}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: `${comp.c}25`, color: comp.c }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2 + i * 0.15, type: "spring", damping: 10 }}
              >
                {comp.t}
              </motion.div>
            ))}
          </div>
          <div className="text-xs font-mono" style={{ color: colors.gray }}>
            type + value + topology
          </div>
        </motion.div>
      </div>

      {/* Match badge */}
      <motion.div
        className="mt-10 px-6 py-3 rounded-xl border flex items-center gap-3"
        style={{
          borderColor: `${colors.green}50`,
          background: `${colors.green}10`,
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.8, type: "spring", damping: 12 }}
      >
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ delay: 3.2, duration: 0.5 }}
        >
          &#x2713;
        </motion.span>
        <div>
          <div className="font-bold" style={{ color: colors.green }}>
            Type accuracy: 99.8%
          </div>
          <div className="text-sm" style={{ color: colors.grayLight }}>
            Pr&eacute;diction haute pr&eacute;cision sur 150k &eacute;chantillons
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
