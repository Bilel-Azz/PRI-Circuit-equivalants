"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const exigencesOriginales = [
  { id: "EF1", text: "Générer des datasets synthétiques de circuits", prio: "MUST" },
  { id: "EF2", text: "Entraîner un modèle IA pour prédire les circuits", prio: "MUST" },
  { id: "EF3", text: "Calculer Z(f) via solveur MNA", prio: "MUST" },
  { id: "EF4", text: "Représentation vectorielle des circuits", prio: "MUST" },
];

const ajoutsPerso = [
  { id: "EF5", text: "API backend pour l'inférence (FastAPI)", prio: "ADDED" },
  { id: "EF6", text: "Interface web de visualisation (Next.js)", prio: "ADDED" },
];

const prioColors: Record<string, string> = {
  MUST: colors.blue,
  ADDED: colors.green,
};

const tools = [
  { name: "PyTorch", desc: "Modèle IA", color: colors.orange },
  { name: "FastAPI", desc: "Backend", color: colors.green },
  { name: "Next.js", desc: "Frontend", color: colors.white },
  { name: "Python", desc: "Solveur MNA", color: colors.cyan },
];

export default function CahierDesChargesSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.blue}15`, color: colors.blue }}>
          01 — Cahier des charges
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-8" style={{ color: colors.white }}>
        Cahier des charges
      </motion.h2>

      <div className="flex gap-8 w-full max-w-5xl">
        {/* Exigences table */}
        <motion.div variants={fadeUp}
          className="flex-[2] rounded-2xl border overflow-hidden"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
          {/* Original requirements */}
          <div className="px-4 py-2 text-sm font-mono border-b flex items-center justify-between"
            style={{ borderColor: colors.border, color: colors.grayLight }}>
            <span>Périmètre initial — Modèle IA</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${colors.blue}20`, color: colors.blue }}>REQUIS</span>
          </div>
          <motion.div className="p-2" variants={staggerFast}>
            {exigencesOriginales.map((ex) => (
              <motion.div key={ex.id} variants={fadeUp}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="font-mono text-xs w-8" style={{ color: colors.gray }}>{ex.id}</span>
                <span className="flex-1" style={{ color: colors.white }}>{ex.text}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{ background: `${prioColors[ex.prio]}15`, color: prioColors[ex.prio] }}>
                  {ex.prio}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Personal additions */}
          <div className="px-4 py-2 text-sm font-mono border-y flex items-center justify-between"
            style={{ borderColor: colors.border, color: colors.grayLight }}>
            <span>Ajouts personnels — Initiative propre</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${colors.green}20`, color: colors.green }}>AJOUTÉ</span>
          </div>
          <motion.div className="p-2" variants={staggerFast}>
            {ajoutsPerso.map((ex) => (
              <motion.div key={ex.id} variants={fadeUp}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="font-mono text-xs w-8" style={{ color: colors.gray }}>{ex.id}</span>
                <span className="flex-1" style={{ color: colors.white }}>{ex.text}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{ background: `${prioColors[ex.prio]}15`, color: prioColors[ex.prio] }}>
                  {ex.prio}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right column: constraints + tools */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Constraints */}
          <motion.div variants={scaleIn}
            className="p-5 rounded-2xl border"
            style={{ borderColor: `${colors.yellow}20`, background: `${colors.yellow}05` }}>
            <div className="text-sm font-mono mb-3" style={{ color: colors.yellow }}>Contraintes</div>
            <div className="flex flex-col gap-2 text-sm" style={{ color: colors.grayLight }}>
              <div>• 100% données synthétiques</div>
              <div>• Durée : 5 mois</div>
            </div>
          </motion.div>

          {/* Tools */}
          <motion.div variants={scaleIn}
            className="p-5 rounded-2xl border"
            style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
            <div className="text-sm font-mono mb-3" style={{ color: colors.grayLight }}>Outils</div>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <div key={tool.name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${tool.color}08` }}>
                  <div className="w-1.5 h-4 rounded-full" style={{ background: tool.color }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: tool.color }}>{tool.name}</div>
                    <div className="text-[10px]" style={{ color: colors.gray }}>{tool.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
