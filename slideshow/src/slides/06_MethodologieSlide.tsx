"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const phases = [
  {
    num: "1",
    label: "Exploration & premiers prototypes",
    desc: "Recherche biblio, choix d'architecture (CNN + Transformer), premières expérimentations, pipeline de données",
    color: colors.blue,
    period: "Oct",
  },
  {
    num: "⏸",
    label: "Pause — problèmes personnels",
    desc: "Arrêt du projet pendant environ 6 semaines",
    color: colors.resistor,
    period: "Nov — 20 déc",
    isGap: true,
  },
  {
    num: "2",
    label: "Pivot & modèles V1→V5",
    desc: "Reprise intensive, datasets V1-V3, decoder contraint (0% self-loops), modèle V5 = meilleur résultat",
    color: colors.green,
    period: "20 déc — mi-jan",
  },
  {
    num: "3",
    label: "Expérimentations V8→V12",
    desc: "REINFORCE, 6 canaux dérivées, classificateur — 5 versions testées, toutes inférieures à V5. Diagnostic : biais dataset",
    color: colors.orange,
    period: "Jan — début fév",
  },
  {
    num: "4",
    label: "Intégration & déploiement",
    desc: "Application web (FastAPI + Next.js), inférence Best-of-50, déploiement OVH (GPU) + Vercel",
    color: colors.cyan,
    period: "Fév",
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
            key={phase.num + phase.label}
            className="flex items-start gap-4 relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.2, type: "spring", stiffness: 120 }}
          >
            {/* Circle */}
            <div
              className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10"
              style={{
                background: `${phase.color}20`,
                color: phase.color,
                border: `2px ${("isGap" in phase && phase.isGap) ? "dashed" : "solid"} ${phase.color}`,
              }}
            >
              {phase.num}
            </div>

            {/* Content */}
            <div
              className="flex-1 rounded-xl px-4 py-3 border"
              style={{
                borderColor: `${phase.color}30`,
                background: `${phase.color}08`,
                borderStyle: ("isGap" in phase && phase.isGap) ? "dashed" : "solid",
                opacity: ("isGap" in phase && phase.isGap) ? 0.6 : 1,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: phase.color }}>{phase.label}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${colors.bg}`, color: colors.gray }}>
                  {phase.period}
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
