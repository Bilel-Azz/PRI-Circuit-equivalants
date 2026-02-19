"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";
import { Target, BarChart3, Cog, Flag } from "lucide-react";

const sections = [
  { num: "01", title: "Contexte & Problématique", Icon: Target, color: colors.blue },
  { num: "02", title: "Gestion de Projet", Icon: BarChart3, color: colors.cyan },
  { num: "03", title: "Réalisation Technique", Icon: Cog, color: colors.green },
  { num: "04", title: "Bilan & Conclusion", Icon: Flag, color: colors.purple },
];

const subsections = [
  ["Contexte", "Probl\u00e9matique", "Le d\u00e9fi", "Cahier des charges"],
  ["M\u00e9thodologie", "Planning", "Risques", "SPER"],
  ["Explorations & Pivot", "G\u00e9n\u00e9rateur & Topologies", "Pipeline de donn\u00e9es", "Architecture IA", "Datasets & R\u00e9sultats", "Exp\u00e9rimentations", "Backend & Frontend"],
  ["Probl\u00e8mes", "Bilan", "Am\u00e9liorations", "D\u00e9mo"],
];

export default function SommaireSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-12" style={{ color: colors.white }}>
        Sommaire
      </motion.h2>

      <div className="grid grid-cols-4 gap-6 w-full max-w-5xl">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.num}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15, type: "spring", damping: 20 }}
            className="flex flex-col rounded-2xl border p-5 relative overflow-hidden"
            style={{ borderColor: `${sec.color}30`, background: `${sec.color}06` }}
          >
            {/* Big number background */}
            <div className="absolute -top-2 -right-1 text-6xl font-bold opacity-[0.06]" style={{ color: sec.color }}>
              {sec.num}
            </div>

            <sec.Icon className="mb-2" size={24} style={{ color: sec.color }} />
            <div className="text-xs font-mono mb-2" style={{ color: sec.color }}>{sec.num}</div>
            <div className="text-sm font-semibold mb-3" style={{ color: colors.white }}>{sec.title}</div>

            {/* Subsections */}
            <div className="flex flex-col gap-1">
              {subsections[i].map((sub, j) => (
                <motion.div
                  key={sub}
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: colors.grayLight }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 + j * 0.08 }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ background: sec.color }} />
                  {sub}
                </motion.div>
              ))}
            </div>

            {/* Bottom accent line */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: sec.color }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
