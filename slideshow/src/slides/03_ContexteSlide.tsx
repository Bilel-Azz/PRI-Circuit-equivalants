"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

export default function ContexteSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Section badge */}
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.blue}15`, color: colors.blue }}>
          01 — Contexte
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-5xl font-bold mb-3" style={{ color: colors.white }}>
        Contexte du projet
      </motion.h2>
      <motion.p variants={fadeUp} className="text-lg mb-10" style={{ color: colors.grayLight }}>
        Un problème inverse en électronique
      </motion.p>

      <div className="flex gap-8 w-full max-w-5xl">
        {/* Academic context */}
        <motion.div variants={scaleIn}
          className="flex-1 p-6 rounded-2xl border"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
          <div className="text-sm font-mono mb-3" style={{ color: colors.blue }}>Cadre académique</div>
          <div className="text-base mb-2" style={{ color: colors.white }}>PRI 5ème année</div>
          <div className="text-sm" style={{ color: colors.grayLight }}>
            Projet de Recherche & Innovation<br />
            Polytech Tours — Formation ISIE
          </div>
        </motion.div>

        {/* The problem */}
        <motion.div variants={scaleIn}
          className="flex-1 p-6 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}30`, background: `${colors.cyan}06` }}>
          <div className="text-sm font-mono mb-3" style={{ color: colors.cyan }}>Le défi</div>
          <div className="text-base mb-2" style={{ color: colors.white }}>
            Prédire un circuit à partir de sa signature fréquentielle
          </div>
          <div className="flex items-center gap-3 mt-4">
            {/* Mini Z(f) curve */}
            <div className="flex flex-col items-center">
              <svg width="80" height="35" viewBox="0 0 80 35">
                <motion.path
                  d="M0,25 Q20,5 40,18 T80,10"
                  fill="none" stroke={colors.cyan} strokeWidth="2"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </svg>
              <span className="text-[10px] font-mono" style={{ color: colors.gray }}>Z(f)</span>
            </div>
            <motion.span style={{ color: colors.cyan }} className="text-xl"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              →
            </motion.span>
            <motion.span className="text-lg" style={{ color: colors.cyan }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
              ?
            </motion.span>
            <motion.span style={{ color: colors.cyan }} className="text-xl"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
              →
            </motion.span>
            {/* Mini circuit */}
            <motion.div className="flex gap-1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
              {["R", "L", "C"].map((c, i) => (
                <span key={c} className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${[colors.resistor, colors.inductor, colors.capacitor][i]}25`,
                    color: [colors.resistor, colors.inductor, colors.capacitor][i] }}>
                  {c}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Approach */}
        <motion.div variants={scaleIn}
          className="flex-1 p-6 rounded-2xl border"
          style={{ borderColor: `${colors.green}30`, background: `${colors.green}06` }}>
          <div className="text-sm font-mono mb-3" style={{ color: colors.green }}>Approche</div>
          <div className="text-base mb-2" style={{ color: colors.white }}>
            100% données synthétiques
          </div>
          <div className="text-sm" style={{ color: colors.grayLight }}>
            1. Générer des circuits aléatoires<br />
            2. Calculer Z(f) via solveur MNA<br />
            3. Entraîner un modèle supervisé
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
