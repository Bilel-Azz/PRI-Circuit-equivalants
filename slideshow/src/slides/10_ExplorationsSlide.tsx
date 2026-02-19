"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerSlow } from "@/lib/animations";
import { colors } from "@/lib/theme";

const approaches = [
  {
    title: "Solver différentiable",
    desc: "Backpropagation à travers le solveur MNA",
    why: "Instabilité numérique : admittances sur 28 ordres de grandeur",
    result: "238% d'erreur — mode collapse",
    color: colors.cyan,
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50">
        <motion.path d="M5,40 Q15,10 25,25 T45,5" fill="none" stroke={colors.cyan} strokeWidth="2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.8 }} />
        <motion.text x="25" y="48" textAnchor="middle" fill={colors.resistor} fontSize="16" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>{"×"}</motion.text>
      </svg>
    ),
  },
  {
    title: "REINFORCE (RL)",
    desc: "Policy gradient sans supervision",
    why: "Pas de signal d'apprentissage : reward ≈ 0 au départ",
    result: 'Mode collapse → toujours "capacitor only"',
    color: colors.purple,
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50">
        <motion.circle cx="25" cy="25" r="18" fill="none" stroke={colors.purple} strokeWidth="2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.8 }} />
        <motion.path d="M18,18 L32,32 M32,18 L18,32" stroke={colors.resistor} strokeWidth="2.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.4 }} />
      </svg>
    ),
  },
  {
    title: "Matrice 8×8",
    desc: "Prédiction de graphe sous forme matricielle",
    why: "90% de positions vides → modèle prédit \"rien\" partout",
    result: "48% accuracy seulement",
    color: colors.orange,
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <motion.rect key={`${r}${c}`} x={8 + c * 14} y={8 + r * 14} width="10" height="10" rx="2"
              fill={r === c ? `${colors.orange}40` : `${colors.grayDark}40`}
              stroke={r === c ? colors.orange : colors.grayDark} strokeWidth="0.5"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 1.2 + (r * 3 + c) * 0.05, type: "spring" }} />
          ))
        )}
        <motion.text x="25" y="48" textAnchor="middle" fill={colors.resistor} fontSize="16" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>{"×"}</motion.text>
      </svg>
    ),
  },
];

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
        Approches explorées
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-10" style={{ color: colors.grayLight }}>
        3 approches testées et abandonnées — chaque échec a guidé la suite
      </motion.p>

      <motion.div className="flex gap-6" variants={staggerSlow}>
        {approaches.map((a) => (
          <motion.div
            key={a.title}
            variants={fadeUp}
            className="flex flex-col p-6 rounded-2xl border relative overflow-hidden"
            style={{ borderColor: `${a.color}25`, background: `${a.color}04`, width: 280 }}
          >
            {/* Failed stamp */}
            <motion.div
              className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: `${colors.resistor}15`, color: colors.resistor }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, type: "spring" }}
            >
              ABANDON
            </motion.div>

            {/* Icon */}
            <div className="mb-4">{a.icon}</div>

            <div className="text-base font-bold mb-1" style={{ color: a.color }}>{a.title}</div>
            <div className="text-sm mb-3" style={{ color: colors.grayLight }}>{a.desc}</div>

            {/* Why it failed */}
            <div className="mt-auto">
              <div className="text-[10px] font-mono mb-1" style={{ color: colors.gray }}>CAUSE</div>
              <div className="text-xs mb-2" style={{ color: colors.grayLight }}>{a.why}</div>
              <div className="text-xs font-mono px-2 py-1 rounded" style={{ background: `${colors.resistor}10`, color: colors.resistor }}>
                {a.result}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lesson learned */}
      <motion.div
        className="mt-8 px-5 py-3 rounded-xl border"
        style={{ borderColor: `${colors.green}30`, background: `${colors.green}08` }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
      >
        <span className="text-sm" style={{ color: colors.green }}>
          Leçon : approche supervisée + représentation séquentielle = la bonne direction
        </span>
      </motion.div>
    </motion.div>
  );
}
