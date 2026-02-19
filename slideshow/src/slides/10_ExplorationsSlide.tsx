"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

export default function ExplorationsSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Explorations
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-2" style={{ color: colors.white }}>
        Première approche : matrice 8x8
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-10" style={{ color: colors.grayLight }}>
        Représenter le circuit comme un graphe sous forme matricielle
      </motion.p>

      <div className="flex gap-10 items-center w-full max-w-4xl">
        {/* Left: the matrix visualization */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center p-6 rounded-2xl border"
          style={{ borderColor: `${colors.orange}25`, background: `${colors.orange}04` }}
        >
          {/* 8x8 grid */}
          <div className="text-xs font-mono mb-3" style={{ color: colors.orange }}>
            Matrice d{"'"}adjacence 8x8
          </div>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Grid cells */}
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => {
                const hasValue = (r === 0 && c === 1) || (r === 1 && c === 2) || (r === 2 && c === 3);
                return (
                  <motion.rect
                    key={`${r}${c}`}
                    x={c * 24 + 4}
                    y={r * 24 + 4}
                    width="20"
                    height="20"
                    rx="3"
                    fill={hasValue ? `${colors.orange}30` : `${colors.grayDark}15`}
                    stroke={hasValue ? colors.orange : `${colors.grayDark}30`}
                    strokeWidth="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + (r * 8 + c) * 0.01, type: "spring" }}
                  />
                );
              })
            )}
            {/* "0" labels in empty cells */}
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => {
                const hasValue = (r === 0 && c === 1) || (r === 1 && c === 2) || (r === 2 && c === 3);
                if (hasValue) {
                  const labels = ["R", "L", "C"];
                  const idx = r;
                  return (
                    <text key={`t${r}${c}`} x={c * 24 + 14} y={r * 24 + 18}
                      textAnchor="middle" fill={colors.orange} fontSize="8" fontWeight="bold" fontFamily="monospace">
                      {labels[idx]}
                    </text>
                  );
                }
                return (
                  <text key={`t${r}${c}`} x={c * 24 + 14} y={r * 24 + 18}
                    textAnchor="middle" fill={`${colors.grayDark}40`} fontSize="7" fontFamily="monospace">
                    0
                  </text>
                );
              })
            )}
          </svg>
          <motion.div
            className="mt-3 text-xs font-mono px-3 py-1 rounded"
            style={{ background: `${colors.resistor}10`, color: colors.resistor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            90% de zéros
          </motion.div>
        </motion.div>

        {/* Right: problems */}
        <motion.div variants={fadeUp} className="flex-1 flex flex-col gap-4">
          {[
            {
              title: "Le problème",
              desc: "Un circuit de 3 composants remplit seulement 3 cases sur 64. Le modèle apprend à prédire \"rien\" partout.",
              color: colors.orange,
            },
            {
              title: "Résultat",
              desc: "48% accuracy — le modèle prédit des matrices quasi-vides, incapable de placer les composants au bon endroit.",
              color: colors.resistor,
            },
            {
              title: "Leçon tirée",
              desc: "Il faut une représentation compacte où chaque nombre compte. C'est ce qui a motivé les tokens séquentiels.",
              color: colors.green,
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="p-4 rounded-xl border"
              style={{ borderColor: `${item.color}30`, background: `${item.color}06` }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.2, type: "spring" }}
            >
              <div className="text-sm font-bold mb-1" style={{ color: item.color }}>
                {item.title}
              </div>
              <div className="text-xs" style={{ color: colors.grayLight }}>
                {item.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom: lesson */}
      <motion.div
        className="mt-8 px-5 py-3 rounded-xl border"
        style={{ borderColor: `${colors.green}30`, background: `${colors.green}08` }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        <span className="text-sm" style={{ color: colors.green }}>
          {"Conclusion : "}
          <span className="font-bold">contraintes architecturales</span>
          {" (masking, tokens) > pénalités de loss"}
        </span>
      </motion.div>
    </motion.div>
  );
}
