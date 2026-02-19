"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

function curvePath(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = t * 200;
    const y = 60 - 40 * Math.exp(-((t - 0.35) ** 2) / 0.008) + 8 * Math.sin(t * 25);
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
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.blue}15`, color: colors.blue }}>
          01 — Problématique
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-5xl font-bold mb-3" style={{ color: colors.white }}>
        Le problème inverse
      </motion.h2>
      <motion.p variants={fadeUp} className="text-lg mb-12" style={{ color: colors.grayLight }}>
        {"Comment retrouver le circuit à partir de sa courbe d'impédance ?"}
      </motion.p>

      {/* Visual pipeline: Curve → AI → Circuit */}
      <div className="flex items-center gap-6">
        {/* Input: Z(f) curve */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-6 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}40`, background: `${colors.cyan}06`, width: 260 }}>
          <div className="text-sm font-mono mb-3" style={{ color: colors.cyan }}>Mesure : Z(f)</div>
          <svg width="200" height="80" viewBox="0 0 200 80">
            <motion.path d={curvePath()} fill="none" stroke={colors.cyan} strokeWidth="2.5" strokeLinecap="round"
              variants={drawPath} />
            <motion.path d={curvePath()} fill="none" stroke={colors.cyan} strokeWidth="8" strokeLinecap="round"
              opacity="0.15" variants={drawPath} />
          </svg>
          <div className="text-xs font-mono mt-2" style={{ color: colors.gray }}>100 fréquences log-spaced</div>
        </motion.div>

        {/* Arrow with question mark */}
        <motion.div className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}>
          <svg width="80" height="30">
            <motion.line x1="5" y1="15" x2="65" y2="15" stroke={colors.blue} strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.5 }} />
            <motion.polygon points="62,9 75,15 62,21" fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} />
          </svg>
          <motion.div
            className="text-3xl font-bold"
            style={{ color: colors.blue }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ?
          </motion.div>
        </motion.div>

        {/* Output: Circuit */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-6 rounded-2xl border"
          style={{ borderColor: `${colors.green}40`, background: `${colors.green}06`, width: 260 }}>
          <div className="text-sm font-mono mb-3" style={{ color: colors.green }}>Circuit : R, L, C</div>
          {/* Animated circuit schematic */}
          <svg width="200" height="80" viewBox="0 0 200 80">
            {/* Wires */}
            <motion.line x1="10" y1="40" x2="45" y2="40" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 0.3 }} />
            <motion.line x1="75" y1="40" x2="110" y2="40" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2, duration: 0.3 }} />
            <motion.line x1="140" y1="40" x2="190" y2="40" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.5, duration: 0.3 }} />
            {/* R box */}
            <motion.rect x="45" y="28" width="30" height="24" rx="4" fill={`${colors.resistor}20`} stroke={colors.resistor} strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.7, type: "spring", damping: 12 }} />
            <motion.text x="53" y="44" fill={colors.resistor} fontSize="11" fontWeight="bold" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>R</motion.text>
            {/* L box */}
            <motion.rect x="110" y="28" width="30" height="24" rx="4" fill={`${colors.inductor}20`} stroke={colors.inductor} strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.2, type: "spring", damping: 12 }} />
            <motion.text x="119" y="44" fill={colors.inductor} fontSize="11" fontWeight="bold" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}>L</motion.text>
            {/* C plates */}
            <motion.line x1="155" y1="25" x2="155" y2="55" stroke={colors.capacitor} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.7, duration: 0.2 }} />
            <motion.line x1="163" y1="25" x2="163" y2="55" stroke={colors.capacitor} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.8, duration: 0.2 }} />
          </svg>
          <div className="text-xs font-mono mt-2" style={{ color: colors.gray }}>topologie + valeurs</div>
        </motion.div>
      </div>

      {/* Key questions */}
      <motion.div className="flex gap-4 mt-10" variants={staggerContainer}>
        {[
          { q: "Quelle topologie ?", sub: "Série, parallèle, mixte..." },
          { q: "Quels composants ?", sub: "R, L, C et combien ?" },
          { q: "Quelles valeurs ?", sub: "100\u03A9 ? 10mH ? 1\u00B5F ?" },
        ].map((item) => (
          <motion.div key={item.q} variants={fadeUp}
            className="px-5 py-3 rounded-xl border text-center"
            style={{ borderColor: colors.border, background: `${colors.bgCard}88` }}>
            <div className="text-sm font-semibold" style={{ color: colors.white }}>{item.q}</div>
            <div className="text-xs mt-1" style={{ color: colors.gray }}>{item.sub}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
