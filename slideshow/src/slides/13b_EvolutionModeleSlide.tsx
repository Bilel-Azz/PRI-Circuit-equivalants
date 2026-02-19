"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const versions = [
  {
    version: "V1–V2",
    change: "Heads indépendantes, loss basique (MSE + CrossEntropy)",
    metrics: { type: "94.8%", selfLoops: "42%", valid: "9%" },
    highlight: "selfLoops",
    color: colors.resistor,
  },
  {
    version: "V3",
    change: "Loss V2 : pénalités de validité (self-loop, duplicate, GND/IN)",
    metrics: { type: "96%", selfLoops: "20%", valid: "30%" },
    highlight: "selfLoops",
    color: colors.orange,
  },
  {
    version: "V4",
    change: "Decoder contraint : masking node_b ≠ node_a",
    metrics: { type: "97.2%", selfLoops: "0%", valid: "60%" },
    highlight: "valid",
    color: colors.yellow,
  },
  {
    version: "V5",
    change: "Dataset V3 (150k équilibré, templates) + 100 epochs",
    metrics: { type: "99.8%", selfLoops: "0%", valid: "~40%" },
    highlight: "type",
    color: colors.green,
    isBest: true,
  },
  {
    version: "V6",
    change: "Dataset V4 (doubles forcées) + tau annealing agressif",
    metrics: { type: "66%", selfLoops: "0%", valid: "—" },
    highlight: "type",
    color: colors.resistor,
    isFail: true,
    note: "Overfitting epoch 15 → retour V5",
  },
];

export default function EvolutionModeleSlide() {
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
          03 — Entraînement
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Du premier modèle au V5
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-6"
        style={{ color: colors.grayLight }}
      >
        Itérations, debug, amélioration progressive
      </motion.p>

      {/* Timeline */}
      <div className="relative flex flex-col gap-3 w-full max-w-5xl">
        {/* Vertical line */}
        <motion.div
          className="absolute left-[18px] top-2 bottom-2 w-[2px]"
          style={{ background: colors.border }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />

        {versions.map((v, i) => (
          <motion.div
            key={v.version}
            className="flex items-start gap-4 relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.2, type: "spring", stiffness: 120 }}
          >
            {/* Circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10"
              style={{
                background: `${v.color}20`,
                color: v.color,
                border: `2px solid ${v.color}`,
              }}
            >
              {v.isBest ? "★" : v.isFail ? "✗" : (i + 1)}
            </div>

            {/* Content */}
            <div
              className="flex-1 flex items-center gap-4 rounded-xl px-4 py-2.5 border"
              style={{
                borderColor: `${v.color}30`,
                background: `${v.color}06`,
                opacity: v.isFail ? 0.6 : 1,
              }}
            >
              {/* Version tag */}
              <div
                className="text-xs font-bold font-mono px-2 py-0.5 rounded"
                style={{ background: `${v.color}20`, color: v.color, minWidth: 50, textAlign: "center" }}
              >
                {v.version}
              </div>

              {/* Change description */}
              <div className="flex-1">
                <div className="text-xs" style={{ color: colors.grayLight }}>{v.change}</div>
                {v.note && (
                  <div className="text-[10px] mt-0.5 font-bold" style={{ color: colors.resistor }}>
                    {v.note}
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="flex gap-3 text-[10px] font-mono shrink-0">
                <div style={{ color: v.highlight === "type" ? v.color : colors.gray }}>
                  <span style={{ color: colors.grayDark }}>type: </span>
                  {v.metrics.type}
                </div>
                <div style={{ color: v.highlight === "selfLoops" ? v.color : colors.gray }}>
                  <span style={{ color: colors.grayDark }}>loops: </span>
                  {v.metrics.selfLoops}
                </div>
                <div style={{ color: v.highlight === "valid" ? v.color : colors.gray }}>
                  <span style={{ color: colors.grayDark }}>valid: </span>
                  {v.metrics.valid}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom insight */}
      <motion.div
        className="mt-5 px-5 py-2.5 rounded-xl border"
        style={{ borderColor: `${colors.yellow}30`, background: `${colors.yellow}08` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-sm" style={{ color: colors.yellow }}>
          {"💡 Chaque itération corrige UN problème précis — tâtonner intelligemment"}
        </span>
      </motion.div>
    </motion.div>
  );
}
