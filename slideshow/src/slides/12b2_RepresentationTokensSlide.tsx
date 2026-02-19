"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const tokens = [
  { type: "R", typeColor: colors.resistor, nodeA: "0", nodeB: "1", value: "100Ω", norm: "-1.0" },
  { type: "L", typeColor: colors.inductor, nodeA: "1", nodeB: "2", value: "10mH", norm: "0.0" },
  { type: "C", typeColor: colors.capacitor, nodeA: "2", nodeB: "3", value: "1µF", norm: "2.0" },
  { type: "—", typeColor: colors.grayDark, nodeA: "—", nodeB: "—", value: "padding", norm: "—" },
];

const normRules = [
  { type: "R", formula: "log₁₀(R) − 3", example: "100Ω → log₁₀(100) − 3 = −1.0", color: colors.resistor },
  { type: "L", formula: "log₁₀(L) + 4", example: "10mH → log₁₀(0.01) + 4 = 2.0", color: colors.inductor },
  { type: "C", formula: "log₁₀(C) + 8", example: "1µF → log₁₀(10⁻⁶) + 8 = 2.0", color: colors.capacitor },
];

export default function RepresentationTokensSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{ background: `${colors.green}15`, color: colors.green }}
        >
          03 — Représentation
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Tokens séquentiels
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-6"
        style={{ color: colors.grayLight }}
      >
        Chaque composant = un token de 4 valeurs
      </motion.p>

      {/* Token visualization */}
      <motion.div
        className="w-full max-w-5xl mb-6"
        variants={staggerFast}
      >
        {/* Header row */}
        <div className="flex gap-1 mb-2 px-2">
          <div className="w-20 text-[10px] font-mono" style={{ color: colors.gray }}>type</div>
          <div className="w-16 text-[10px] font-mono" style={{ color: colors.gray }}>node_a</div>
          <div className="w-16 text-[10px] font-mono" style={{ color: colors.gray }}>node_b</div>
          <div className="w-20 text-[10px] font-mono" style={{ color: colors.gray }}>valeur</div>
          <div className="flex-1 text-[10px] font-mono" style={{ color: colors.gray }}>normalisé</div>
        </div>

        {/* Token rows */}
        {tokens.map((tok, i) => (
          <motion.div
            key={i}
            className="flex gap-1 mb-1.5"
            variants={fadeUp}
          >
            {/* Token number */}
            <div
              className="w-6 h-8 flex items-center justify-center text-[10px] font-mono rounded-l-lg"
              style={{ background: `${colors.grayDark}40`, color: colors.gray }}
            >
              {i + 1}
            </div>
            {/* Type */}
            <div
              className="w-20 h-8 flex items-center justify-center text-xs font-bold rounded-sm"
              style={{
                background: `${tok.typeColor}20`,
                color: tok.typeColor,
                border: `1px solid ${tok.typeColor}40`,
              }}
            >
              {tok.type}
            </div>
            {/* Node A */}
            <div
              className="w-16 h-8 flex items-center justify-center text-xs font-mono rounded-sm"
              style={{ background: `${colors.cyan}10`, color: colors.cyan, border: `1px solid ${colors.cyan}20` }}
            >
              {tok.nodeA}
            </div>
            {/* Node B */}
            <div
              className="w-16 h-8 flex items-center justify-center text-xs font-mono rounded-sm"
              style={{ background: `${colors.purple}10`, color: colors.purple, border: `1px solid ${colors.purple}20` }}
            >
              {tok.nodeB}
            </div>
            {/* Value */}
            <div
              className="w-20 h-8 flex items-center justify-center text-xs font-mono rounded-sm"
              style={{ background: `${colors.white}05`, color: colors.grayLight, border: `1px solid ${colors.border}` }}
            >
              {tok.value}
            </div>
            {/* Normalized */}
            <div
              className="flex-1 h-8 flex items-center px-3 text-xs font-mono rounded-r-sm"
              style={{ background: `${colors.green}08`, color: colors.green, border: `1px solid ${colors.green}15` }}
            >
              {tok.norm}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex gap-6 w-full max-w-5xl">
        {/* Normalization rules */}
        <motion.div
          className="flex-1 p-4 rounded-xl border"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="text-xs font-mono mb-2" style={{ color: colors.grayLight }}>
            Normalisation des valeurs → tout dans [−4, +4]
          </div>
          {normRules.map((rule) => (
            <div key={rule.type} className="flex items-center gap-3 mb-1.5">
              <span className="text-xs font-bold w-4" style={{ color: rule.color }}>{rule.type}</span>
              <span className="text-[10px] font-mono" style={{ color: colors.grayLight }}>{rule.formula}</span>
              <span className="text-[10px] font-mono" style={{ color: colors.gray }}>{rule.example}</span>
            </div>
          ))}
        </motion.div>

        {/* Advantages */}
        <motion.div
          className="flex-1 p-4 rounded-xl border"
          style={{ borderColor: `${colors.green}25`, background: `${colors.green}06` }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="text-xs font-mono mb-2" style={{ color: colors.green }}>
            Avantages
          </div>
          <div className="flex flex-col gap-2">
            {[
              "Taille fixe : 6 × 4 = 24 nombres → batch GPU",
              "Padding naturel : type = NONE pour slots vides",
              "Compatible Transformer : séquence ordonnée",
              "Contrainte intégrée : node_b ≠ node_a (masking)",
            ].map((adv, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]" style={{ color: colors.grayLight }}>
                <span style={{ color: colors.green }}>✓</span>
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
