"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const experiments = [
  {
    version: "V8",
    title: "Training double-only",
    change: "50k circuits 100% double résonance",
    result: "Overfitting epoch 15, type 100% mais valeurs fausses",
    why: "Dataset non filtré, pas assez de diversité",
    color: colors.orange,
  },
  {
    version: "V9c",
    title: "Dataset V4 amélioré",
    change: "150k samples, résonances espacées",
    result: "Pas mieux que V5",
    why: "Les doubles résonances générées restent trop subtiles",
    color: colors.orange,
  },
  {
    version: "V10",
    title: "Encoder 6 canaux",
    change: "+dérivées 1ère et 2ème de |Z| et phase",
    result: "Type accuracy dégradée : 99.8% → 90%",
    why: "REINFORCE perturbe l'apprentissage",
    color: colors.resistor,
  },
  {
    version: "V11",
    title: "Classifier + REINFORCE",
    change: "Head de classification (mono/single/double)",
    result: "Type accuracy crash : 99.8% → 87%",
    why: "REINFORCE détruit le decoder même à faible poids",
    color: colors.resistor,
  },
  {
    version: "V12",
    title: "Classifier sans REINFORCE",
    change: "Même V11 mais sans REINFORCE",
    result: "Type 99.9% mais trop de composants",
    why: "Biais du dataset V4 (50% circuits 5-6 composants)",
    color: colors.orange,
  },
];

export default function ExperimentationsSlide() {
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
          style={{ background: `${colors.orange}15`, color: colors.orange }}
        >
          03 — Expérimentations
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Expériences post-V5
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="text-sm mb-6"
        style={{ color: colors.grayLight }}
      >
        5 tentatives pour dépasser le modèle V5 — toutes échouées
      </motion.p>

      <motion.div
        className="grid grid-cols-5 gap-3 w-full max-w-5xl"
        variants={staggerFast}
      >
        {experiments.map((exp) => (
          <motion.div
            key={exp.version}
            variants={fadeUp}
            className="flex flex-col p-3 rounded-xl border"
            style={{
              borderColor: `${exp.color}25`,
              background: `${exp.color}06`,
            }}
          >
            {/* Version badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                style={{ background: `${exp.color}20`, color: exp.color }}
              >
                {exp.version}
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                style={{
                  background: `${colors.resistor}15`,
                  color: colors.resistor,
                }}
              >
                ✕
              </span>
            </div>

            {/* Title */}
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: colors.white }}
            >
              {exp.title}
            </div>

            {/* Change */}
            <div
              className="text-[10px] mb-1.5"
              style={{ color: colors.cyan }}
            >
              Δ {exp.change}
            </div>

            {/* Result */}
            <div
              className="text-[10px] mb-1.5"
              style={{ color: colors.grayLight }}
            >
              → {exp.result}
            </div>

            {/* Why */}
            <div
              className="text-[10px] mt-auto pt-2 border-t"
              style={{
                color: colors.gray,
                borderColor: `${exp.color}15`,
              }}
            >
              {exp.why}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Conclusion */}
      <motion.div
        variants={fadeUp}
        className="mt-6 px-6 py-3 rounded-xl border flex items-center gap-3"
        style={{
          borderColor: `${colors.green}25`,
          background: `${colors.green}06`,
        }}
      >
        <span
          className="text-sm font-bold font-mono"
          style={{ color: colors.green }}
        >
          Conclusion
        </span>
        <span className="text-sm" style={{ color: colors.grayLight }}>
          V5 reste le meilleur modèle — le problème vient du dataset et des
          limites de l{"'"}architecture, pas du manque d{"'"}expérimentation
        </span>
      </motion.div>
    </motion.div>
  );
}
