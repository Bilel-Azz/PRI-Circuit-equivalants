"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const problems = [
  {
    title: "Overfitting modèle V6",
    desc: "Tau annealing trop agressif : val_loss diverge à epoch 15",
    solution: "Retour au V5 stable, redesign du scheduler V7",
    status: "Résolu",
    color: colors.orange,
  },
  {
    title: "Lissage des courbes complexes",
    desc: "Le modèle prédit un RLC simple au lieu d'une double résonance",
    solution: "Dataset vérifié + 5 expériences (V8-V12) → non résolu, limite architecture",
    status: "Non résolu",
    color: colors.orange,
  },
  {
    title: "Circuits invalides (duplicates)",
    desc: "36-42% de validité : edges dupliquées restent un problème",
    solution: "Masking résout self-loops, duplicates à traiter",
    status: "En cours",
    color: colors.yellow,
  },
  {
    title: "Dataset biaisé (root cause)",
    desc: "Les générateurs 'double résonance' ne produisent que <15% de vraies doubles visibles",
    solution: "Dataset V5 vérifié testé (100% features) → modèle plafonne quand même",
    status: "Limite archi",
    color: colors.orange,
  },
  {
    title: "Arrêt novembre → 20 décembre",
    desc: "Problèmes personnels : aucun avancement pendant ~7 semaines",
    solution: "Reprise intense le 20 décembre, rattrapage en janvier",
    status: "Rattrapé",
    color: colors.green,
  },
];

const statusColors: Record<string, string> = {
  "Résolu": colors.green,
  "Partiel": colors.yellow,
  "Non résolu": colors.orange,
  "En cours": colors.orange,
  "Limite archi": colors.resistor,
  "Rattrapé": colors.green,
};

export default function ProblemesSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.purple}15`, color: colors.purple }}>
          04 — Problèmes
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-8" style={{ color: colors.white }}>
        Problèmes rencontrés
      </motion.h2>

      <motion.div className="flex flex-col gap-4 w-full max-w-4xl" variants={staggerFast}>
        {problems.map((p) => (
          <motion.div key={p.title} variants={fadeUp}
            className="flex items-start gap-4 p-4 rounded-xl border"
            style={{ borderColor: `${p.color}20`, background: `${p.color}04` }}>
            {/* Status dot */}
            <div className="mt-1">
              <motion.div className="w-3 h-3 rounded-full" style={{ background: p.color }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-semibold" style={{ color: colors.white }}>{p.title}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: `${statusColors[p.status]}15`, color: statusColors[p.status] }}>
                  {p.status}
                </span>
              </div>
              <div className="text-xs mb-1.5" style={{ color: colors.grayLight }}>{p.desc}</div>
              <div className="text-xs" style={{ color: colors.green }}>
                → {p.solution}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
