"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const componentTypes = [
  { type: "R", label: "Résistance", range: "1Ω → 1MΩ", color: colors.resistor },
  { type: "L", label: "Inductance", range: "1µH → 100mH", color: colors.inductor },
  { type: "C", label: "Capacité", range: "1pF → 100µF", color: colors.capacitor },
];

const templates = [
  { name: "RLC série", desc: "Résonance simple", pct: "20%", color: colors.cyan },
  { name: "Tank LC", desc: "Anti-résonance", pct: "25%", color: colors.blue },
  { name: "Double rés.", desc: "2 pics séparés", pct: "25%", color: colors.purple },
  { name: "Notch + autres", desc: "Filtres, ladder", pct: "30%", color: colors.orange },
];

export default function GenerateurSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Générateur
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Générateur de circuits
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        100% données synthétiques — chaque circuit est généré aléatoirement puis résolu
      </motion.p>

      <div className="flex gap-6 w-full max-w-5xl">
        {/* Left: Generation process */}
        <motion.div variants={fadeUp} className="flex-1 flex flex-col gap-4">
          {/* Step-by-step process */}
          <div className="flex flex-col gap-3">
            {[
              { step: "1", label: "Choisir le nombre de composants", detail: "1 à 6 composants par circuit", color: colors.blue },
              { step: "2", label: "Tirer les types aléatoirement", detail: "R, L ou C (distribution contrôlée)", color: colors.cyan },
              { step: "3", label: "Générer les valeurs log-uniform", detail: "Couvre 6+ ordres de grandeur", color: colors.green },
              { step: "4", label: "Connecter les nœuds", detail: "4 nœuds : GND(0), IN(1), + 2 internes", color: colors.purple },
            ].map((s, i) => (
              <motion.div key={s.step}
                className="flex items-center gap-4 p-3 rounded-xl"
                style={{ background: `${s.color}06` }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, type: "spring" }}>
                <motion.div className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm"
                  style={{ background: `${s.color}20`, color: s.color }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.15, type: "spring" }}>
                  {s.step}
                </motion.div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: colors.white }}>{s.label}</div>
                  <div className="text-[10px]" style={{ color: colors.gray }}>{s.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Component ranges + templates */}
        <div className="flex flex-col gap-4" style={{ width: 320 }}>
          {/* Component value ranges */}
          <motion.div variants={scaleIn}
            className="p-5 rounded-2xl border"
            style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
            <div className="text-sm font-mono mb-3" style={{ color: colors.grayLight }}>Plages de valeurs</div>
            <div className="flex flex-col gap-2">
              {componentTypes.map((c, i) => (
                <motion.div key={c.type}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}>
                  <span className="text-lg font-bold font-mono w-6" style={{ color: c.color }}>{c.type}</span>
                  <div className="flex-1">
                    <div className="text-xs" style={{ color: colors.white }}>{c.label}</div>
                    <div className="text-[10px] font-mono" style={{ color: colors.gray }}>{c.range}</div>
                  </div>
                  {/* Log-uniform bar */}
                  <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: c.color }}
                      initial={{ width: 0 }} animate={{ width: "100%" }}
                      transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }} />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-[10px] font-mono mt-3" style={{ color: colors.gray }}>
              Distribution log-uniforme → couverture large
            </div>
          </motion.div>

          {/* Templates (V3) */}
          <motion.div variants={scaleIn}
            className="p-5 rounded-2xl border"
            style={{ borderColor: `${colors.blue}20`, background: `${colors.blue}05` }}>
            <div className="text-sm font-mono mb-3" style={{ color: colors.blue }}>Templates (V3+)</div>
            <motion.div className="flex flex-col gap-1.5" variants={staggerFast}>
              {templates.map((t) => (
                <motion.div key={t.name} variants={fadeUp}
                  className="flex items-center gap-2 text-xs">
                  <div className="w-1 h-4 rounded-full" style={{ background: t.color }} />
                  <span className="font-semibold" style={{ color: colors.white }}>{t.name}</span>
                  <span style={{ color: colors.gray }}>{t.desc}</span>
                  <span className="ml-auto font-mono" style={{ color: t.color }}>{t.pct}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
