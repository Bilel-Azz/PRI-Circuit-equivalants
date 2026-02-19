"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const deliverables = [
  { phase: "Spécif.", items: ["CdC", "Représentation circuits"], done: true },
  { phase: "Conception", items: ["Architecture modèle", "Pipeline données"], done: true },
  { phase: "Réalisation", items: ["Modèle V5", "Backend API", "Frontend web"], done: true },
  { phase: "Validation", items: ["Tests accuracy", "Déploiement OVH"], done: true },
  { phase: "GdP", items: ["SPER", "Risques", "Gantt"], done: true },
  { phase: "École", items: ["Rapport", "Slides", "Démo"], done: true },
];

const competences = [
  { skill: "Deep Learning", detail: "PyTorch, architectures, loss design", color: colors.blue },
  { skill: "Data Engineering", detail: "Génération synthétique, distribution", color: colors.cyan },
  { skill: "Full-Stack", detail: "FastAPI + Next.js + déploiement", color: colors.green },
  { skill: "Gestion de projet", detail: "Cycle en V, SPER, risques", color: colors.purple },
  { skill: "Résilience", detail: "Reprise après pause, itération rapide", color: colors.orange },
];

export default function BilanSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.purple}15`, color: colors.purple }}>
          04 — Bilan
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-8" style={{ color: colors.white }}>
        Bilan & Compétences
      </motion.h2>

      <div className="flex gap-8 w-full max-w-5xl">
        {/* Deliverables */}
        <motion.div variants={fadeUp}
          className="flex-1 rounded-2xl border overflow-hidden"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
          <div className="px-4 py-2 text-sm font-mono border-b" style={{ borderColor: colors.border, color: colors.grayLight }}>
            Livrables
          </div>
          <div className="p-3 flex flex-col gap-2">
            {deliverables.map((d, i) => (
              <motion.div key={d.phase}
                className="flex items-center gap-3 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}>
                <motion.span style={{ color: colors.green }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, type: "spring" }}>
                  ✓
                </motion.span>
                <span className="font-mono text-xs w-16" style={{ color: colors.gray }}>{d.phase}</span>
                <span style={{ color: colors.grayLight }}>{d.items.join(", ")}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Competences */}
        <motion.div variants={fadeUp}
          className="flex-1 flex flex-col gap-3">
          <div className="text-sm font-mono mb-1" style={{ color: colors.grayLight }}>
            Compétences acquises
          </div>
          {competences.map((c, i) => (
            <motion.div key={c.skill}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: `${c.color}20`, background: `${c.color}05` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.12, type: "spring" }}>
              <div className="w-1.5 h-8 rounded-full" style={{ background: c.color }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: c.color }}>{c.skill}</div>
                <div className="text-[10px]" style={{ color: colors.gray }}>{c.detail}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
