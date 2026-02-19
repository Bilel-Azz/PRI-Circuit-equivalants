"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const allSections = [
  {
    num: "01",
    title: "Contexte & Probl\u00e9matique",
    color: colors.blue,
    items: ["Contexte du projet", "Le probl\u00e8me inverse", "Pourquoi c\u2019est difficile", "Cahier des charges"],
  },
  {
    num: "02",
    title: "Gestion de Projet",
    color: colors.cyan,
    items: ["M\u00e9thodologie Cycle en V", "Planning r\u00e9el", "Analyse des risques", "Indicateurs SPER"],
  },
  {
    num: "03",
    title: "R\u00e9alisation Technique",
    color: colors.green,
    items: [
      "Explorations & Pivot",
      "G\u00e9n\u00e9rateur & Topologies",
      "Pipeline de donn\u00e9es (MNA, encodage)",
      "Architecture IA (CNN + Transformer)",
      "Datasets, entra\u00eenement & r\u00e9sultats",
      "Application web (Backend + Frontend)",
    ],
  },
  {
    num: "04",
    title: "Bilan & Conclusion",
    color: colors.purple,
    items: ["Probl\u00e8mes rencontr\u00e9s", "Bilan & comp\u00e9tences", "Axes d\u2019am\u00e9lioration", "D\u00e9mo en direct"],
  },
];

function TransitionSlide({ currentIndex }: { currentIndex: number }) {
  const current = allSections[currentIndex];

  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Progress bar: all 4 sections */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 mb-16">
        {allSections.map((sec, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={sec.num} className="flex items-center gap-2">
              {/* Section dot/badge */}
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: isCurrent ? `${sec.color}20` : "transparent",
                  border: isCurrent ? `1.5px solid ${sec.color}` : `1px solid ${colors.grayDark}`,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isCurrent ? 1.05 : 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
              >
                {isDone && (
                  <span className="text-xs font-bold" style={{ color: sec.color }}>
                    {"\u2713"}
                  </span>
                )}
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: isCurrent ? sec.color : isFuture ? colors.grayDark : sec.color }}
                >
                  {sec.num}
                </span>
                <span
                  className="text-[11px] hidden sm:inline"
                  style={{ color: isCurrent ? colors.white : isFuture ? colors.grayDark : colors.grayLight }}
                >
                  {sec.title}
                </span>
              </motion.div>

              {/* Connector line */}
              {i < 3 && (
                <motion.div
                  className="w-6 h-[1px]"
                  style={{ background: isDone ? sec.color : colors.grayDark }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Main content */}
      <div className="flex items-center gap-12">
        {/* Big number */}
        <motion.div
          className="text-[120px] font-bold leading-none font-mono"
          style={{ color: `${current.color}15` }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 15 }}
        >
          {current.num}
        </motion.div>

        {/* Title + items */}
        <div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-bold mb-6"
            style={{ color: colors.white }}
          >
            {current.title}
          </motion.h2>

          <div className="flex flex-col gap-2.5">
            {current.items.map((item, j) => (
              <motion.div
                key={item}
                className="flex items-center gap-3 text-base"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + j * 0.1, type: "spring" }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: current.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + j * 0.1, type: "spring" }}
                />
                <span style={{ color: colors.grayLight }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${current.color}, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      />
    </motion.div>
  );
}

export function Transition01() {
  return <TransitionSlide currentIndex={0} />;
}
export function Transition02() {
  return <TransitionSlide currentIndex={1} />;
}
export function Transition03() {
  return <TransitionSlide currentIndex={2} />;
}
export function Transition04() {
  return <TransitionSlide currentIndex={3} />;
}
