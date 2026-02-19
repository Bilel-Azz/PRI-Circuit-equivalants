"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const cycleSteps = [
  { num: "1", label: "Exploration", desc: "Recherche biblio, étude des approches existantes", color: colors.cyan },
  { num: "2", label: "Prototypage", desc: "Implémentation rapide d'une solution candidate", color: colors.blue },
  { num: "3", label: "Test", desc: "Évaluation sur le dataset, mesure des métriques", color: colors.green },
  { num: "4", label: "Analyse", desc: "Diagnostic des erreurs, identification des limites", color: colors.orange },
  { num: "5", label: "Amélioration", desc: "Correction ciblée du problème identifié", color: colors.purple },
];

export default function MethodologieSlide() {
  const cx = 460;
  const cy = 185;
  const rx = 170;
  const ry = 120;

  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>
          02 — Méthodologie
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-2" style={{ color: colors.white }}>
        Démarche exploratoire & itérative
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-6" style={{ color: colors.grayLight }}>
        Un cycle répété à chaque version du modèle
      </motion.p>

      {/* Cycle diagram */}
      <motion.div variants={fadeUp} className="relative">
        <svg width="920" height="370" viewBox="0 0 920 370">
          {/* Ellipse path (dashed) */}
          <motion.ellipse
            cx={cx} cy={cy} rx={rx} ry={ry}
            fill="none"
            stroke={`${colors.border}`}
            strokeWidth="1.5"
            strokeDasharray="8 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ delay: 0.5, duration: 1.5 }}
          />

          {/* Curved arrows between steps */}
          <defs>
            <marker id="cycleArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill={colors.grayLight} />
            </marker>
          </defs>

          {/* Steps positioned around the ellipse */}
          {cycleSteps.map((step, i) => {
            // Position each step around the ellipse
            const angle = -Math.PI / 2 + (i / cycleSteps.length) * 2 * Math.PI;
            const x = cx + rx * 1.35 * Math.cos(angle);
            const y = cy + ry * 1.35 * Math.sin(angle);
            const circleX = cx + rx * Math.cos(angle);
            const circleY = cy + ry * Math.sin(angle);

            // Arrow from this node to next node on ellipse
            const nextAngle = -Math.PI / 2 + ((i + 0.5) / cycleSteps.length) * 2 * Math.PI;
            const arrowX = cx + rx * Math.cos(nextAngle);
            const arrowY = cy + ry * Math.sin(nextAngle);

            return (
              <motion.g
                key={step.num}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.2, type: "spring", damping: 15 }}
              >
                {/* Connector line from ellipse to card */}
                <line
                  x1={circleX} y1={circleY}
                  x2={x} y2={y}
                  stroke={`${step.color}30`}
                  strokeWidth="1"
                />

                {/* Node on ellipse */}
                <circle
                  cx={circleX} cy={circleY} r="14"
                  fill={`${step.color}20`}
                  stroke={step.color}
                  strokeWidth="2"
                />
                <text
                  x={circleX} y={circleY + 4}
                  textAnchor="middle"
                  fill={step.color}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {step.num}
                </text>

                {/* Arrow on ellipse between nodes */}
                <motion.circle
                  cx={arrowX} cy={arrowY} r="3"
                  fill={step.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ delay: 1.8 + i * 0.3, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />

                {/* Label card */}
                <rect
                  x={x - 70} y={y - 22}
                  width="140" height="44"
                  rx="8"
                  fill={`${step.color}08`}
                  stroke={`${step.color}25`}
                  strokeWidth="1"
                />
                <text
                  x={x} y={y - 5}
                  textAnchor="middle"
                  fill={step.color}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  {step.label}
                </text>
                <text
                  x={x} y={y + 12}
                  textAnchor="middle"
                  fill={colors.gray}
                  fontSize="8"
                  fontFamily="system-ui"
                >
                  {step.desc}
                </text>
              </motion.g>
            );
          })}

          {/* Center label */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <text x={cx} y={cy - 5} textAnchor="middle" fill={colors.white} fontSize="13" fontWeight="bold">
              Cycle itératif
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={colors.gray} fontSize="10">
              12 versions testées
            </text>
          </motion.g>
        </svg>
      </motion.div>

      {/* Bottom insight */}
      <motion.div
        className="mt-2 flex gap-4 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        {[
          { label: "12 versions testées", detail: "Seule V5 retenue", icon: "V5" },
          { label: "Pivot majeur", detail: "Problème = dataset, pas modèle", icon: "!" },
          { label: "Projet individuel", detail: "Autonomie totale sur les choix", icon: "1" },
        ].map((item) => (
          <div key={item.label} className="px-4 py-2 rounded-lg border text-center" style={{ borderColor: colors.border }}>
            <div className="text-sm font-bold font-mono" style={{ color: colors.blue }}>{item.icon}</div>
            <div className="text-xs font-semibold" style={{ color: colors.white }}>{item.label}</div>
            <div className="text-[10px] mt-0.5" style={{ color: colors.gray }}>{item.detail}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
