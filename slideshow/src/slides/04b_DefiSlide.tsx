"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";
import { AlertTriangle } from "lucide-react";

export default function DefiSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.blue}15`, color: colors.blue }}>
          01 — Le d{"\u00e9"}fi
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Pourquoi c{"'"}est difficile
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        {"Un probl\u00e8me mal pos\u00e9 : plusieurs circuits \u2192 m\u00eame courbe Z(f)"}
      </motion.p>

      {/* Ill-posed visual: 2 circuits → same curve */}
      <div className="flex gap-6 items-center mb-8">
        {/* Circuit A */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-4 rounded-2xl border"
          style={{ borderColor: `${colors.resistor}30`, background: `${colors.resistor}06`, width: 180 }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.resistor }}>Circuit A</div>
          <svg width="150" height="45" viewBox="0 0 150 45">
            <motion.line x1="5" y1="22" x2="25" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
            <motion.rect x="25" y="10" width="30" height="24" rx="3" fill={`${colors.resistor}20`} stroke={colors.resistor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }} />
            <motion.text x="34" y="25" fill={colors.resistor} fontSize="9" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>R</motion.text>
            <motion.line x1="55" y1="22" x2="70" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
            <motion.rect x="70" y="10" width="30" height="24" rx="3" fill={`${colors.inductor}20`} stroke={colors.inductor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring" }} />
            <motion.text x="80" y="25" fill={colors.inductor} fontSize="9" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>L</motion.text>
            <motion.line x1="100" y1="22" x2="115" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1 }} />
            <motion.rect x="115" y="10" width="30" height="24" rx="3" fill={`${colors.capacitor}20`} stroke={colors.capacitor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }} />
            <motion.text x="124" y="25" fill={colors.capacitor} fontSize="9" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>C</motion.text>
          </svg>
          <div className="text-[10px] font-mono mt-1" style={{ color: colors.gray }}>RLC s{"\u00e9"}rie</div>
        </motion.div>

        {/* Both arrows converge to same curve */}
        <motion.div className="flex flex-col items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          <svg width="50" height="50" viewBox="0 0 50 50">
            <motion.line x1="0" y1="15" x2="35" y2="25" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5 }} />
            <motion.polygon points="33,20 45,25 33,30" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} />
            <motion.line x1="0" y1="35" x2="35" y2="25" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6 }} />
          </svg>
        </motion.div>

        {/* Same Z(f) curve */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-4 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}40`, background: `${colors.cyan}06`, width: 180 }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.cyan }}>M{"\u00ea"}me Z(f)</div>
          <svg width="140" height="50" viewBox="0 0 140 50">
            <motion.path d="M5,40 Q30,38 50,15 Q65,5 75,20 Q90,42 130,35" fill="none" stroke={colors.cyan} strokeWidth="2.5" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 1 }} />
            <motion.path d="M5,40 Q30,38 50,15 Q65,5 75,20 Q90,42 130,35" fill="none" stroke={colors.cyan} strokeWidth="8" strokeLinecap="round"
              opacity="0.1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 1 }} />
          </svg>
          <div className="text-[10px] font-mono" style={{ color: colors.gray }}>courbe identique</div>
        </motion.div>

        {/* Arrow back to question */}
        <motion.div className="flex flex-col items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <svg width="50" height="50" viewBox="0 0 50 50">
            <motion.line x1="0" y1="25" x2="35" y2="15" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.1 }} />
            <motion.polygon points="33,10 45,15 33,20" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }} />
            <motion.line x1="0" y1="25" x2="35" y2="35" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.2 }} />
            <motion.polygon points="33,30 45,35 33,40" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} />
          </svg>
        </motion.div>

        {/* Circuit B (different) */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-4 rounded-2xl border"
          style={{ borderColor: `${colors.green}30`, background: `${colors.green}06`, width: 180 }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.green }}>Circuit B</div>
          <svg width="150" height="45" viewBox="0 0 150 45">
            {/* Different topology: R series with L||C */}
            <motion.line x1="5" y1="22" x2="25" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }} />
            <motion.rect x="25" y="10" width="30" height="24" rx="3" fill={`${colors.resistor}20`} stroke={colors.resistor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }} />
            <motion.text x="33" y="25" fill={colors.resistor} fontSize="9" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>R{"'"}</motion.text>
            <motion.line x1="55" y1="22" x2="70" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9 }} />
            {/* Parallel bracket */}
            <motion.rect x="70" y="3" width="65" height="38" rx="5" fill="none" stroke={colors.grayDark} strokeWidth="1" strokeDasharray="3"
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }} />
            <motion.rect x="78" y="6" width="22" height="16" rx="2" fill={`${colors.inductor}20`} stroke={colors.inductor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: "spring" }} />
            <motion.text x="84" y="17" fill={colors.inductor} fontSize="7" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>L{"'"}</motion.text>
            <motion.rect x="106" y="6" width="22" height="16" rx="2" fill={`${colors.capacitor}20`} stroke={colors.capacitor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }} />
            <motion.text x="112" y="17" fill={colors.capacitor} fontSize="7" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>C{"'"}</motion.text>
            <motion.text x="90" y="35" fill={colors.gray} fontSize="7" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>parall{"\u00e8"}le</motion.text>
            <motion.line x1="135" y1="22" x2="150" y2="22" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4 }} />
          </svg>
          <div className="text-[10px] font-mono mt-1" style={{ color: colors.gray }}>R + (L{"\u2016"}C) diff{"\u00e9"}rent</div>
        </motion.div>
      </div>

      {/* Key insight */}
      <motion.div
        className="px-6 py-3 rounded-xl border mb-6"
        style={{ borderColor: `${colors.yellow}30`, background: `${colors.yellow}08` }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5, type: "spring" }}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} style={{ color: colors.yellow }} />
          <span className="text-sm font-semibold" style={{ color: colors.yellow }}>
            On cherche UN circuit {"\u00e9"}quivalent, pas LE circuit original !
          </span>
        </div>
      </motion.div>

      {/* 3 challenges */}
      <motion.div className="flex gap-4" variants={staggerFast}>
        {[
          { num: "28", label: "ordres de grandeur", desc: "Les valeurs vont de 0.000001 à 1 000 000", color: colors.blue },
          { num: "3", label: "prédictions simultanées", desc: "Type + Valeur + Connexions pour chaque composant", color: colors.green },
          { num: "1–10", label: "composants possibles", desc: "On ne sait pas combien il y en a à l'avance", color: colors.purple },
        ].map((c) => (
          <motion.div key={c.label} variants={fadeUp}
            className="flex flex-col items-center p-4 rounded-xl border flex-1"
            style={{ borderColor: `${c.color}20`, background: `${c.color}05` }}>
            <div className="text-3xl font-bold font-mono" style={{ color: c.color }}>{c.num}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: colors.white }}>{c.label}</div>
            <div className="text-[10px] mt-1 text-center" style={{ color: colors.gray }}>{c.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
