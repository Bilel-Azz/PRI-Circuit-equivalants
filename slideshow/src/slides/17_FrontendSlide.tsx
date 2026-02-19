"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";
import { LineChart, Search, Wrench, Brain } from "lucide-react";

export default function FrontendSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Architecture complète
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Architecture bout en bout
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-10" style={{ color: colors.grayLight }}>
        Frontend Next.js ↔ Backend FastAPI ↔ Modèle PyTorch
      </motion.p>

      <div className="flex items-center gap-5">
        {/* Frontend */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-5 rounded-2xl border" style={{ borderColor: `${colors.white}15`, background: `${colors.bgCard}ee`, width: 250 }}>
          {/* Mac window bar */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-2 text-[10px] font-mono" style={{ color: colors.gray }}>localhost:3000</span>
          </div>
          {/* Mock UI */}
          <motion.div className="rounded-lg p-3 mb-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="text-[10px] font-mono mb-2" style={{ color: colors.grayLight }}>Visualiseur de circuits</div>
            <svg width="210" height="45" viewBox="0 0 210 45">
              <motion.line x1="5" y1="22" x2="40" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
              <motion.rect x="40" y="12" width="35" height="22" rx="3" fill={`${colors.resistor}25`} stroke={colors.resistor} strokeWidth="1"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }} />
              <motion.text x="50" y="27" fill={colors.resistor} fontSize="9" fontFamily="monospace"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>R</motion.text>
              <motion.line x1="75" y1="22" x2="105" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1 }} />
              <motion.rect x="105" y="12" width="35" height="22" rx="3" fill={`${colors.inductor}25`} stroke={colors.inductor} strokeWidth="1"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }} />
              <motion.text x="115" y="27" fill={colors.inductor} fontSize="9" fontFamily="monospace"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>L</motion.text>
              <motion.line x1="140" y1="22" x2="165" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3 }} />
              <motion.rect x="165" y="12" width="35" height="22" rx="3" fill={`${colors.capacitor}25`} stroke={colors.capacitor} strokeWidth="1"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4, type: "spring" }} />
              <motion.text x="175" y="27" fill={colors.capacitor} fontSize="9" fontFamily="monospace"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>C</motion.text>
            </svg>
          </motion.div>
          <motion.div variants={staggerFast} className="flex flex-col gap-1.5">
            {[
              { icon: LineChart, label: "Graphiques interactifs" },
              { icon: Search, label: "Exploration candidats" },
              { icon: Wrench, label: "Réparation circuits" },
            ].map((f) => (
              <motion.div key={f.label} variants={fadeUp} className="flex items-center gap-1.5 text-[10px]" style={{ color: colors.grayLight }}>
                <f.icon size={10} /> {f.label}
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-3 text-[10px] font-mono" style={{ color: colors.blue }}>Next.js + React + Tailwind</div>
        </motion.div>

        {/* Bidirectional arrows */}
        <motion.div className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <div className="relative">
            <svg width="90" height="20">
              <motion.line x1="5" y1="10" x2="75" y2="10" stroke={colors.cyan} strokeWidth="1.5" strokeDasharray="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 0.5 }} />
              <motion.polygon points="72,5 85,10 72,15" fill={colors.cyan}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} />
            </svg>
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="absolute top-[6px] w-1.5 h-1.5 rounded-full" style={{ background: colors.cyan, left: 5 }}
                animate={{ x: [0, 75], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 1.8 + i * 0.4, ease: "linear" }} />
            ))}
          </div>
          <div className="relative">
            <svg width="90" height="20">
              <motion.line x1="75" y1="10" x2="5" y2="10" stroke={colors.green} strokeWidth="1.5" strokeDasharray="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.5 }} />
              <motion.polygon points="8,5 -5,10 8,15" fill={colors.green}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} />
            </svg>
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="absolute top-[6px] w-1.5 h-1.5 rounded-full" style={{ background: colors.green, left: 75 }}
                animate={{ x: [0, -70], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 2 + i * 0.4, ease: "linear" }} />
            ))}
          </div>
        </motion.div>

        {/* Backend */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-5 rounded-2xl border" style={{ borderColor: `${colors.green}25`, background: `${colors.green}05`, width: 200 }}>
          <div className="flex items-center gap-2 mb-3">
            <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: colors.green }}
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="font-bold text-sm" style={{ color: colors.green }}>FastAPI</span>
          </div>
          <motion.div variants={staggerFast} className="flex flex-col gap-1.5">
            {[
              { label: "Inference", color: colors.blue },
              { label: "MNA Solver", color: colors.cyan },
              { label: "Validator", color: colors.yellow },
              { label: "Repair", color: colors.orange },
            ].map((item) => (
              <motion.div key={item.label} variants={fadeUp}
                className="flex items-center gap-2 p-1.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="w-1 h-4 rounded-full" style={{ background: item.color }} />
                <span style={{ color: colors.white }}>{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Arrow to model */}
        <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
          </svg>
        </motion.div>

        {/* Model */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-5 rounded-2xl border" style={{ borderColor: `${colors.blue}30`, background: `${colors.blue}06`, width: 130 }}>
          <motion.div className="mb-2" style={{ color: colors.blue }}
            animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Brain size={32} />
          </motion.div>
          <div className="text-sm font-bold" style={{ color: colors.blue }}>PyTorch</div>
          <div className="text-[10px] font-mono" style={{ color: colors.gray }}>model_v5.pt</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
