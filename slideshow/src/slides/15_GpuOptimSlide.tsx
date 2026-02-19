"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const optimisations = [
  {
    title: "Vectorisation MNA",
    desc: "Solveur d'impédance : boucles Python → opérations tensorielles GPU",
    before: "1700 ms / batch",
    after: "5 ms / batch",
    speedup: "340×",
    color: colors.cyan,
    detail: "3 boucles imbriquées (batch × séquence × fréquence) → une seule opération tensorielle",
  },
  {
    title: "Best-of-N",
    desc: "Générer N candidats avec température τ, garder celui avec le meilleur RMSE",
    before: "RMSE = 3.05 (N=1)",
    after: "RMSE = 0.35 (N=50)",
    speedup: "−88%",
    color: colors.green,
    detail: "Stratégie stochastique : la diversité augmente les chances de trouver un bon circuit",
  },
  {
    title: "Réparation automatique",
    desc: "Post-traitement des circuits invalides générés par le modèle",
    before: "~40% circuits valides",
    after: "~65% après repair",
    speedup: "+62%",
    color: colors.purple,
    detail: "Supprime self-loops, fusionne duplicates, vérifie connectivité GND↔IN",
  },
];

export default function GpuOptimSlide() {
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
          03 — Optimisations
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Optimisations
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-8"
        style={{ color: colors.grayLight }}
      >
        {"Accélérer l'entraînement et améliorer l'inférence"}
      </motion.p>

      <div className="flex flex-col gap-4 w-full max-w-5xl">
        {optimisations.map((opt, i) => (
          <motion.div
            key={opt.title}
            className="flex items-stretch gap-4 rounded-xl border overflow-hidden"
            style={{ borderColor: `${opt.color}25`, background: `${opt.color}04` }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.25, type: "spring", stiffness: 120 }}
          >
            {/* Left: title + description */}
            <div className="flex-1 p-4">
              <div className="text-sm font-bold mb-1" style={{ color: opt.color }}>
                {opt.title}
              </div>
              <div className="text-xs mb-2" style={{ color: colors.grayLight }}>
                {opt.desc}
              </div>
              <div className="text-[10px]" style={{ color: colors.gray }}>
                {opt.detail}
              </div>
            </div>

            {/* Right: before/after metrics */}
            <div
              className="flex items-center gap-3 px-5 py-3 shrink-0"
              style={{ background: `${opt.color}08` }}
            >
              <div className="text-center">
                <div className="text-[9px] font-mono uppercase" style={{ color: colors.gray }}>avant</div>
                <div className="text-xs font-mono" style={{ color: colors.resistor }}>{opt.before}</div>
              </div>
              <div className="text-lg" style={{ color: opt.color }}>→</div>
              <div className="text-center">
                <div className="text-[9px] font-mono uppercase" style={{ color: colors.gray }}>après</div>
                <div className="text-xs font-mono" style={{ color: colors.green }}>{opt.after}</div>
              </div>
              <div
                className="text-lg font-bold font-mono px-2 py-1 rounded-lg"
                style={{ background: `${opt.color}20`, color: opt.color }}
              >
                {opt.speedup}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
