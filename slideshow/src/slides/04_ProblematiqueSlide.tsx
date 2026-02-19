"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

/* Simple impedance curve path for mini visuals */
function miniCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = t * 160;
    const y = 30 - 20 * Math.exp(-((t - 0.4) ** 2) / 0.01) + 5 * Math.sin(t * 20);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function ProblematiqueSlide() {
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
          01 — Problème inverse
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Le problème inverse
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-6"
        style={{ color: colors.grayLight }}
      >
        Retrouver le circuit à partir de sa courbe
      </motion.p>

      {/* Forward direction (dimmed, small) */}
      <motion.div
        className="flex items-center gap-3 px-4 py-2 rounded-xl mb-6"
        style={{ background: `${colors.bgCard}88`, border: `1px solid ${colors.border}` }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.5, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-xs font-mono" style={{ color: colors.gray }}>Sens direct :</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${colors.green}15`, color: colors.green }}>Circuit</span>
        <span className="text-xs" style={{ color: colors.grayDark }}>→</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>Z(f)</span>
        <span className="text-xs" style={{ color: colors.green }}>✓</span>
        <span className="text-[10px]" style={{ color: colors.gray }}>ça, on sait faire</span>
      </motion.div>

      {/* Inverse direction (large, highlighted) */}
      <div className="flex items-center gap-6 mb-8">
        {/* Z(f) curve input */}
        <motion.div
          className="flex flex-col items-center p-5 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}40`, background: `${colors.cyan}06`, width: 240 }}
          variants={scaleIn}
        >
          <div className="text-sm font-mono mb-2" style={{ color: colors.cyan }}>
            Courbe Z(f)
          </div>
          <svg width="160" height="50" viewBox="0 0 160 50">
            <motion.path
              d={miniCurve()}
              fill="none"
              stroke={colors.cyan}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 1.2 }}
            />
            <motion.path
              d={miniCurve()}
              fill="none"
              stroke={colors.cyan}
              strokeWidth="8"
              strokeLinecap="round"
              opacity={0.12}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 1.2 }}
            />
          </svg>
          <div className="text-[10px] font-mono mt-1" style={{ color: colors.gray }}>
            mesure fréquentielle
          </div>
        </motion.div>

        {/* Arrow + AI question */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          <svg width="90" height="24">
            <motion.line
              x1="5" y1="12" x2="70" y2="12"
              stroke={colors.blue} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            />
            <motion.polygon
              points="68,5 85,12 68,19"
              fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            />
          </svg>
          <motion.div
            className="text-3xl font-bold"
            style={{ color: colors.blue }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ?
          </motion.div>
          <motion.div
            className="text-xs font-mono px-3 py-1 rounded-full"
            style={{ background: `${colors.blue}20`, color: colors.blue, border: `1px solid ${colors.blue}40` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
          >
            IA
          </motion.div>
        </motion.div>

        {/* Circuit output */}
        <motion.div
          className="flex flex-col items-center p-5 rounded-2xl border"
          style={{ borderColor: `${colors.green}40`, background: `${colors.green}06`, width: 240 }}
          variants={scaleIn}
        >
          <div className="text-sm font-mono mb-2" style={{ color: colors.green }}>
            Circuit prédit
          </div>
          <svg width="160" height="50" viewBox="0 0 160 50">
            {/* Animated circuit building itself */}
            <motion.line x1="5" y1="25" x2="30" y2="25" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.3 }} />
            <motion.rect x="30" y="15" width="28" height="20" rx="4" fill={`${colors.resistor}20`} stroke={colors.resistor} strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2, type: "spring" }} />
            <motion.text x="37" y="28" fill={colors.resistor} fontSize="10" fontWeight="bold" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>R</motion.text>
            <motion.line x1="58" y1="25" x2="78" y2="25" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.2, duration: 0.3 }} />
            <motion.rect x="78" y="15" width="28" height="20" rx="4" fill={`${colors.inductor}20`} stroke={colors.inductor} strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.4, type: "spring" }} />
            <motion.text x="86" y="28" fill={colors.inductor} fontSize="10" fontWeight="bold" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>L</motion.text>
            <motion.line x1="106" y1="25" x2="120" y2="25" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.6, duration: 0.3 }} />
            {/* Capacitor plates */}
            <motion.line x1="120" y1="12" x2="120" y2="38" stroke={colors.capacitor} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.8, duration: 0.2 }} />
            <motion.line x1="127" y1="12" x2="127" y2="38" stroke={colors.capacitor} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.9, duration: 0.2 }} />
            <motion.line x1="127" y1="25" x2="155" y2="25" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 3, duration: 0.3 }} />
          </svg>
          <div className="text-[10px] font-mono mt-1" style={{ color: colors.gray }}>
            topologie + valeurs
          </div>
        </motion.div>
      </div>

      {/* 3 question cards */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, type: "spring" }}
      >
        {[
          { q: "Quelle topologie ?", sub: "Série, parallèle, mixte...", color: colors.blue },
          { q: "Quels composants ?", sub: "R, L, C et combien ?", color: colors.green },
          { q: "Quelles valeurs ?", sub: "100Ω ? 10mH ? 1µF ?", color: colors.purple },
        ].map((item) => (
          <div
            key={item.q}
            className="flex-1 px-5 py-3 rounded-xl border text-center"
            style={{ borderColor: `${item.color}25`, background: `${item.color}06` }}
          >
            <div className="text-sm font-semibold" style={{ color: item.color }}>
              {item.q}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.gray }}>
              {item.sub}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
