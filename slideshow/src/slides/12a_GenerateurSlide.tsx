"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const pipeline = [
  { step: "1", label: "Nb composants", desc: "1 à 6 au hasard", color: colors.blue },
  { step: "2", label: "Types aléatoires", desc: "R, L ou C (uniforme)", color: colors.cyan },
  { step: "3", label: "Valeurs log-uniform", desc: "R: 1Ω–1MΩ, L: 1µH–100mH, C: 1pF–100µF", color: colors.green },
  { step: "4", label: "Connexions random", desc: "Nœuds 0–3 tirés au sort", color: colors.purple },
];

const problems = [
  {
    icon: "🎲",
    title: "Distribution non contrôlée",
    desc: "Impossible de garantir la diversité des courbes — 80% de courbes monotones, très peu de résonances",
    color: colors.orange,
  },
  {
    icon: "⚡",
    title: "Beaucoup de circuits invalides",
    desc: "Composants connectés au même nœud (self-loops), nœuds isolés — seulement 9% de circuits valides",
    color: colors.resistor,
  },
];

export default function GenerateurSlide() {
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
          03 — Génération
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Génération aléatoire
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-6"
        style={{ color: colors.grayLight }}
      >
        Première approche : circuits 100% random
      </motion.p>

      {/* Pipeline steps */}
      <motion.div className="flex gap-3 mb-8 w-full max-w-5xl" variants={staggerFast}>
        {pipeline.map((p, i) => (
          <motion.div
            key={p.step}
            className="flex-1 flex items-start gap-2 p-3 rounded-xl border"
            style={{ borderColor: `${p.color}25`, background: `${p.color}06` }}
            variants={fadeUp}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: `${p.color}20`, color: p.color }}
            >
              {p.step}
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: p.color }}>{p.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: colors.gray }}>{p.desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Problems */}
      <motion.div
        className="text-sm font-mono mb-3"
        style={{ color: colors.resistor }}
        variants={fadeUp}
      >
        Problèmes identifiés
      </motion.div>

      <div className="flex gap-4 w-full max-w-5xl mb-6">
        {problems.map((prob, i) => (
          <motion.div
            key={prob.title}
            className="flex-1 p-4 rounded-xl border"
            style={{ borderColor: `${prob.color}30`, background: `${prob.color}08` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
          >
            <div className="text-lg mb-2">{prob.icon}</div>
            <div className="text-sm font-bold mb-1" style={{ color: prob.color }}>
              {prob.title}
            </div>
            <div className="text-[10px]" style={{ color: colors.grayLight }}>
              {prob.desc}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conclusion */}
      <motion.div
        className="px-5 py-3 rounded-xl border"
        style={{ borderColor: `${colors.green}30`, background: `${colors.green}08` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-sm" style={{ color: colors.green }}>
          {"Solution → "}
          <span className="font-bold">générateur par templates de topologies</span>
        </span>
      </motion.div>
    </motion.div>
  );
}
