"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

export default function PivotSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Le pivot
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Le pivot décisif
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-10" style={{ color: colors.grayLight }}>
        {"De l'exploration à l'approche supervisée qui fonctionne"}
      </motion.p>

      <div className="flex items-center gap-8">
        {/* Before */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-6 rounded-2xl border"
          style={{ borderColor: `${colors.resistor}25`, background: `${colors.resistor}04`, width: 260 }}>
          <div className="text-xs font-mono mb-3" style={{ color: colors.resistor }}>AVANT</div>

          <div className="flex flex-col gap-3">
            {[
              { label: "End-to-end", desc: "Solver dans le training loop" },
              { label: "Repr. matricielle", desc: "Graphe 8×8 (90% vide)" },
              { label: "RL / non-supervisé", desc: "Pas de signal clair" },
            ].map((item, i) => (
              <motion.div key={item.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: `${colors.resistor}08` }}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}>
                <span style={{ color: colors.resistor }}>×</span>
                <div>
                  <div style={{ color: colors.white }}>{item.label}</div>
                  <div className="text-xs" style={{ color: colors.gray }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 text-center text-2xl font-bold font-mono" style={{ color: colors.resistor }}>
            9% valid
          </div>
        </motion.div>

        {/* Arrow with transformation */}
        <motion.div className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}>
          <svg width="80" height="40">
            <motion.line x1="5" y1="20" x2="65" y2="20" stroke={colors.blue} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }} />
            <motion.polygon points="62,12 78,20 62,28" fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} />
          </svg>
          <span className="text-xs font-mono" style={{ color: colors.blue }}>pivot</span>
        </motion.div>

        {/* After */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-6 rounded-2xl border"
          style={{ borderColor: `${colors.green}35`, background: `${colors.green}06`, width: 260 }}>
          <div className="text-xs font-mono mb-3" style={{ color: colors.green }}>APRÈS</div>

          <div className="flex flex-col gap-3">
            {[
              { label: "Supervisé", desc: "Prédiction directe (pas de solver)" },
              { label: "Repr. séquentielle", desc: "6 composants × 4 valeurs" },
              { label: "Decoder contraint", desc: "Masking = 0% self-loops" },
            ].map((item, i) => (
              <motion.div key={item.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: `${colors.green}08` }}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + i * 0.15 }}>
                <span style={{ color: colors.green }}>✓</span>
                <div>
                  <div style={{ color: colors.white }}>{item.label}</div>
                  <div className="text-xs" style={{ color: colors.gray }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-4 text-center text-2xl font-bold font-mono" style={{ color: colors.green }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, type: "spring" }}>
            99.8% acc
          </motion.div>
        </motion.div>
      </div>

      {/* Key insight */}
      <motion.div className="mt-8 text-sm font-mono px-4 py-2 rounded-lg"
        style={{ background: `${colors.blue}08`, color: colors.blue }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        Contraintes architecturales {">"} pénalités dans la loss — masking élimine 100% des self-loops
      </motion.div>
    </motion.div>
  );
}
