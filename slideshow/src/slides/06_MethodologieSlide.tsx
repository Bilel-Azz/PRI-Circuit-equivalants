"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const phases = [
  {
    num: "1",
    label: "Exploration",
    desc: "Recherche biblio, choix d'architecture (CNN vs MLP, Transformer vs RNN), premiers prototypes",
    color: colors.blue,
    weeks: "S1-S4",
  },
  {
    num: "2",
    label: "Premier modèle fonctionnel",
    desc: "Dataset V1-V3, modèle V1-V4, validation sur circuits simples, identification des self-loops",
    color: colors.cyan,
    weeks: "S5-S8",
  },
  {
    num: "3",
    label: "Itérations & expérimentations",
    desc: "12 versions testées (V5-V12), REINFORCE, 6 canaux, classificateur — la plupart ont échoué",
    color: colors.orange,
    weeks: "S9-S14",
  },
  {
    num: "4",
    label: "Diagnostic & analyse",
    desc: "Découverte du biais dataset (<15% de vraies doubles résonances), dataset V5 vérifié",
    color: colors.red,
    weeks: "S15-S16",
  },
  {
    num: "5",
    label: "Intégration & déploiement",
    desc: "Application web (FastAPI + Next.js), inférence Best-of-50, déploiement OVH + Vercel",
    color: colors.green,
    weeks: "S17-S20",
  },
];

export default function MethodologieSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>
          02 — Méthodologie
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-2" style={{ color: colors.white }}>
        Démarche exploratoire & itérative
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        Recherche par expérimentation : tester, mesurer, pivoter
      </motion.p>

      {/* Timeline */}
      <div className="relative flex flex-col gap-3">
        {/* Vertical line */}
        <motion.div
          className="absolute left-[22px] top-2 bottom-2 w-[2px]"
          style={{ background: `${colors.border}` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />

        {phases.map((phase, i) => (
          <motion.div
            key={phase.num}
            className="flex items-start gap-4 relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.2, type: "spring", stiffness: 120 }}
          >
            {/* Circle */}
            <div
              className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10"
              style={{ background: `${phase.color}20`, color: phase.color, border: `2px solid ${phase.color}` }}
            >
              {phase.num}
            </div>

            {/* Content */}
            <div className="flex-1 rounded-xl px-4 py-3 border" style={{ borderColor: `${phase.color}30`, background: `${phase.color}08` }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: phase.color }}>{phase.label}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${colors.bg}`, color: colors.gray }}>
                  {phase.weeks}
                </span>
              </div>
              <div className="text-xs mt-1" style={{ color: colors.grayLight }}>{phase.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom insight */}
      <motion.div
        className="mt-6 flex gap-4 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        {[
          { label: "12 versions testées", detail: "Seule V5 retenue", icon: "🔬" },
          { label: "Pivot majeur", detail: "Problème = dataset, pas modèle", icon: "🔄" },
          { label: "Projet individuel", detail: "Autonomie totale sur les choix", icon: "👤" },
        ].map((item) => (
          <div key={item.label} className="px-4 py-2 rounded-lg border text-center" style={{ borderColor: colors.border }}>
            <div className="text-lg">{item.icon}</div>
            <div className="text-xs font-semibold" style={{ color: colors.white }}>{item.label}</div>
            <div className="text-[10px] mt-0.5" style={{ color: colors.gray }}>{item.detail}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
