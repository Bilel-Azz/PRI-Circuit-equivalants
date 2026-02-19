"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const datasets = [
  {
    version: "V1",
    samples: "50k",
    approach: "Aléatoire",
    why: "Premier dataset : génération purement aléatoire de circuits",
    distribution: "46% simples, 9.9% RLC mixtes",
    problem: "Biais → le modèle ne voit presque que des circuits simples",
    lesson: "La distribution détermine ce que le modèle apprend",
    color: colors.orange,
    barWidths: [80, 20, 10, 5],
  },
  {
    version: "V3",
    samples: "150k",
    approach: "Templates équilibrés",
    why: "Forcer la diversité avec des templates : RLC, tank, double rés.",
    distribution: "20% RLC, 25% Tank, 25% Double rés., 30% autres",
    problem: "Double résonances trop subtiles → pics non distingués",
    lesson: "Les courbes complexes ressemblent trop à des simples",
    color: colors.blue,
    barWidths: [20, 25, 25, 15],
  },
  {
    version: "V4",
    samples: "150k",
    approach: "Double résonances forcées",
    why: "f1/f2 espacées de 2 décades, Q modéré (5-15) → pics visibles",
    distribution: "50% double rés. marquées, 25% simples, 25% variations",
    problem: "Overfitting V6 → tau annealing trop agressif",
    lesson: "Données bonnes mais training schedule à ajuster",
    color: colors.green,
    barWidths: [10, 50, 15, 15],
  },
];

const barLabels = ["Simple", "Résonance", "Tank", "Complexe"];
const barColors = [colors.grayLight, colors.cyan, colors.purple, colors.orange];

export default function DatasetsSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Datasets
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Évolution des datasets
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        Chaque version corrige un problème identifié dans la précédente
      </motion.p>

      {/* Dataset cards with distribution bars */}
      <div className="flex gap-5">
        {datasets.map((ds, di) => (
          <motion.div key={ds.version}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + di * 0.2, type: "spring", damping: 18 }}
            className="flex flex-col p-5 rounded-2xl border relative"
            style={{ borderColor: `${ds.color}30`, background: `${ds.color}05`, width: 280 }}>
            {/* Version badge */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl font-bold font-mono" style={{ color: ds.color }}>{ds.version}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${ds.color}15`, color: ds.color }}>
                {ds.samples}
              </span>
            </div>

            <div className="text-sm font-semibold mb-1" style={{ color: colors.white }}>{ds.approach}</div>

            {/* WHY */}
            <div className="text-xs mb-3 px-2 py-1.5 rounded-lg" style={{ background: `${ds.color}08`, color: ds.color }}>
              {ds.why}
            </div>

            {/* Distribution bars */}
            <div className="flex flex-col gap-1.5 mb-3">
              {ds.barWidths.map((w, bi) => (
                <div key={bi} className="flex items-center gap-2">
                  <span className="text-[9px] w-14 text-right" style={{ color: colors.gray }}>{barLabels[bi]}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: barColors[bi] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ delay: 0.8 + di * 0.2 + bi * 0.1, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[9px] font-mono w-8" style={{ color: colors.gray }}>{w}%</span>
                </div>
              ))}
            </div>

            {/* Problem identified */}
            <div className="px-3 py-1.5 rounded-lg text-xs mb-2" style={{ background: `${colors.yellow}08`, color: colors.yellow }}>
              ⚠ {ds.problem}
            </div>

            {/* Lesson */}
            <div className="text-[10px] mt-auto" style={{ color: colors.grayLight }}>
              → {ds.lesson}
            </div>

            {/* Arrow between cards */}
            {di < datasets.length - 1 && (
              <motion.div className="absolute -right-4 top-1/2 z-10"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 + di * 0.3 }}>
                <span className="text-lg" style={{ color: colors.grayDark }}>→</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Key insight */}
      <motion.div className="mt-6 text-sm px-4 py-2 rounded-lg"
        style={{ background: `${colors.blue}08`, color: colors.blue }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        Règle : le modèle apprend exactement ce sur quoi il est entraîné — la distribution compte plus que la taille
      </motion.div>
    </motion.div>
  );
}
