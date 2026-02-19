"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, slideRight, slideLeft, staggerContainer, staggerFast, glow } from "@/lib/animations";
import { colors } from "@/lib/theme";
import { Brain } from "lucide-react";

const endpoints = [
  { method: "POST", path: "/api/predict", desc: "Prédiction circuit", color: colors.green },
  { method: "POST", path: "/api/impedance", desc: "Calcul Z(f)", color: colors.cyan },
  { method: "GET", path: "/api/health", desc: "Status serveur", color: colors.yellow },
  { method: "POST", path: "/api/candidates", desc: "Top-K candidats", color: colors.purple },
];

export default function BackendSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Backend
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Backend & Inférence
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-10" style={{ color: colors.grayLight }}>
        FastAPI + stratégie Best-of-N pour la sélection de candidats
      </motion.p>

      <div className="flex items-stretch gap-6">
        {/* Model */}
        <motion.div variants={slideRight}
          className="flex flex-col items-center p-5 rounded-2xl border" style={{ borderColor: `${colors.blue}40`, background: `${colors.blue}06`, width: 160 }}>
          <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ background: `${colors.blue}20`, color: colors.blue }}
            animate={{ boxShadow: [`0 0 0px ${colors.blue}00`, `0 0 15px ${colors.blue}30`, `0 0 0px ${colors.blue}00`] }}
            transition={{ duration: 3, repeat: Infinity }}>
            <Brain size={24} />
          </motion.div>
          <div className="font-bold text-sm" style={{ color: colors.blue }}>Model V5</div>
          <div className="text-[10px] font-mono mt-1" style={{ color: colors.gray }}>PyTorch • CPU</div>
        </motion.div>

        {/* Arrow */}
        <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
          </svg>
        </motion.div>

        {/* FastAPI */}
        <motion.div variants={scaleIn}
          className="relative flex flex-col p-5 rounded-2xl border" style={{ borderColor: `${colors.green}40`, background: `${colors.green}05`, minWidth: 300 }}>
          <div className="flex items-center gap-2 mb-4">
            <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: colors.green }} animate={glow} />
            <span className="font-bold" style={{ color: colors.green }}>FastAPI</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full ml-auto" style={{ background: `${colors.green}15`, color: colors.green }}>:8000</span>
          </div>
          <motion.div className="flex flex-col gap-1.5" variants={staggerFast}>
            {endpoints.map((ep) => (
              <motion.div key={ep.path} variants={fadeUp}
                className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${ep.color}20`, color: ep.color, minWidth: 36, textAlign: "center" }}>{ep.method}</span>
                <span className="font-mono text-xs" style={{ color: colors.white }}>{ep.path}</span>
                <span className="text-[10px] ml-auto" style={{ color: colors.gray }}>{ep.desc}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: `1px solid ${colors.green}` }}
            animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 3, repeat: Infinity }} />
        </motion.div>

        {/* Arrow */}
        <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} />
          </svg>
        </motion.div>

        {/* Best-of-N */}
        <motion.div variants={slideLeft}
          className="flex flex-col p-5 rounded-2xl border" style={{ borderColor: colors.border, background: `${colors.bgCard}cc`, width: 220 }}>
          <div className="text-sm font-mono mb-3" style={{ color: colors.yellow }}>Best-of-N</div>
          <div className="flex flex-col gap-1.5">
            {[
              { n: "N=1", rmse: "3.05", color: colors.resistor },
              { n: "N=10", rmse: "0.71", color: colors.orange },
              { n: "N=50", rmse: "0.35", color: colors.green },
            ].map((row, i) => (
              <motion.div key={row.n} className="flex items-center gap-2 text-xs"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + i * 0.15 }}>
                <span className="font-mono w-10" style={{ color: colors.grayLight }}>{row.n}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: row.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(parseFloat(row.rmse) / 3.05) * 100}%` }}
                    transition={{ delay: 1.7 + i * 0.15, duration: 0.5 }} />
                </div>
                <span className="font-mono w-8 text-right" style={{ color: row.color }}>{row.rmse}</span>
              </motion.div>
            ))}
          </div>
          <motion.div className="mt-3 text-xs text-center" style={{ color: colors.green }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
            {"−88.5% d'erreur"}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
