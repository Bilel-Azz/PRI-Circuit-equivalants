"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const improvements = [
  {
    title: "REINFORCE / loss dérivées",
    desc: "Testé : REINFORCE détruit le decoder même à faible poids (V10, V11)",
    status: "Testé ✕",
    color: colors.resistor,
  },
  {
    title: "Dataset vérifié",
    desc: "Testé : dataset 100% doubles vérifiées (50/50 et 70/30) → modèle plafonne",
    status: "Testé ✕",
    color: colors.resistor,
  },
  {
    title: "Nouvelle architecture",
    desc: "Le Transformer V2 atteint ses limites — explorer GNN, diffusion, ou encoder plus expressif",
    status: "Futur",
    color: colors.cyan,
  },
  {
    title: "Validité des circuits",
    desc: "Contraintes supplémentaires pour éliminer les edges dupliquées",
    status: "Planifié",
    color: colors.purple,
  },
  {
    title: "Données réelles",
    desc: "Intégrer des mesures réelles pour valider le transfer learning",
    status: "Futur",
    color: colors.orange,
  },
];

export default function AmeliorationsSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.purple}15`, color: colors.purple }}>
          04 — Améliorations
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-8" style={{ color: colors.white }}>
        {"Axes d'amélioration"}
      </motion.h2>

      <motion.div className="flex flex-col gap-4 w-full max-w-3xl" variants={staggerFast}>
        {improvements.map((item, i) => (
          <motion.div key={item.title} variants={fadeUp}
            className="flex items-center gap-5 p-5 rounded-xl border"
            style={{ borderColor: `${item.color}20`, background: `${item.color}05` }}>
            {/* Number */}
            <motion.div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold font-mono"
              style={{ background: `${item.color}15`, color: item.color }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.15, type: "spring" }}>
              {i + 1}
            </motion.div>
            <div className="flex-1">
              <div className="text-base font-semibold" style={{ color: colors.white }}>{item.title}</div>
              <div className="text-sm mt-0.5" style={{ color: colors.grayLight }}>{item.desc}</div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full"
              style={{ background: `${item.color}15`, color: item.color }}>
              {item.status}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
