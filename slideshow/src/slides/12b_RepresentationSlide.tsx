"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";
import { X, Check } from "lucide-react";

const exampleTokens = [
  { type: "R", typeId: 1, nodeA: 0, nodeB: 1, value: "2.7", raw: "500\u03A9", color: colors.resistor },
  { type: "L", typeId: 2, nodeA: 1, nodeB: 2, value: "-4.0", raw: "100\u00B5H", color: colors.inductor },
  { type: "C", typeId: 3, nodeA: 2, nodeB: 0, value: "-8.0", raw: "10nF", color: colors.capacitor },
  { type: "\u2014", typeId: 0, nodeA: 0, nodeB: 0, value: "\u2014", raw: "\u2014", color: colors.grayDark },
  { type: "\u2014", typeId: 0, nodeA: 0, nodeB: 0, value: "\u2014", raw: "\u2014", color: colors.grayDark },
  { type: "\u2014", typeId: 0, nodeA: 0, nodeB: 0, value: "\u2014", raw: "\u2014", color: colors.grayDark },
];

export default function RepresentationSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Repr{"\u00e9"}sentation
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Comment repr{"\u00e9"}senter un circuit ?
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-6" style={{ color: colors.grayLight }}>
        {"Le format de sortie du mod\u00e8le \u2014 inspir\u00e9 de SMILES (chimie mol\u00e9culaire)"}
      </motion.p>

      {/* ÉCHEC vs SUCCÈS comparison */}
      <div className="flex gap-4 mb-6">
        {/* ÉCHEC: Matrice d'adjacence */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-4 rounded-2xl border flex-1"
          style={{ borderColor: `${colors.resistor}30`, background: `${colors.resistor}06` }}>
          <div className="flex items-center gap-2 mb-3">
            <X size={16} style={{ color: colors.resistor }} />
            <span className="text-xs font-mono font-bold" style={{ color: colors.resistor }}>{"\u00c9"}CHEC : Matrice d{"'"}adjacence (8{"\u00d7"}8)</span>
          </div>
          {/* Mini matrix visualization */}
          <div className="flex items-center gap-3">
            <svg width="80" height="80" viewBox="0 0 80 80">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((r) =>
                [0, 1, 2, 3, 4, 5, 6, 7].map((c) => {
                  const hasValue = (r === 0 && c === 1) || (r === 1 && c === 0) || (r === 1 && c === 2) || (r === 2 && c === 1);
                  return (
                    <motion.rect key={`${r}${c}`}
                      x={1 + c * 10} y={1 + r * 10} width="8" height="8" rx="1"
                      fill={hasValue ? `${colors.resistor}40` : "rgba(255,255,255,0.03)"}
                      stroke={hasValue ? colors.resistor : "rgba(255,255,255,0.06)"} strokeWidth="0.3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + (r * 8 + c) * 0.01 }}
                    />
                  );
                })
              )}
            </svg>
            <div className="flex flex-col gap-1 text-[10px]" style={{ color: colors.grayLight }}>
              <div style={{ color: colors.resistor }}>90% des cases vides</div>
              <div>{"\u2192"} Mod{"\u00e8"}le pr{"\u00e9"}dit {"\u00ab"}VIDE{"\u00bb"} partout</div>
              <div>{"\u2192"} 48% accuracy seulement</div>
            </div>
          </div>
        </motion.div>

        {/* SUCCÈS: Séquence de tokens */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-4 rounded-2xl border flex-1"
          style={{ borderColor: `${colors.green}30`, background: `${colors.green}06` }}>
          <div className="flex items-center gap-2 mb-3">
            <Check size={16} style={{ color: colors.green }} />
            <span className="text-xs font-mono font-bold" style={{ color: colors.green }}>SUCC{"\u00c8"}S : S{"\u00e9"}quence de tokens</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Token flow */}
            <div className="flex items-center gap-1">
              {[
                { label: "R", color: colors.resistor },
                { label: "L", color: colors.inductor },
                { label: "C", color: colors.capacitor },
              ].map((tok, i) => (
                <motion.div key={tok.label} className="flex items-center gap-1"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}>
                  {i > 0 && <span className="text-[10px]" style={{ color: colors.grayDark }}>{"\u2192"}</span>}
                  <div className="px-2 py-1 rounded text-[10px] font-mono font-bold"
                    style={{ background: `${tok.color}20`, color: tok.color, border: `1px solid ${tok.color}40` }}>
                    {tok.label}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-[10px] ml-2" style={{ color: colors.grayLight }}>
              <div style={{ color: colors.green }}>100% positions utiles</div>
              <div>Pas de cases vides inutiles</div>
              <div>{"\u2192"} 99.8% accuracy type</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main content: Token table + Properties */}
      <div className="flex gap-6 w-full max-w-5xl items-start">
        {/* Left: Token table */}
        <motion.div variants={scaleIn}
          className="p-4 rounded-2xl border"
          style={{ borderColor: `${colors.blue}30`, background: `${colors.blue}05` }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.blue }}>
            Exemple RLC s{"\u00e9"}rie : START {"\u2192"} [R, 0, 1] {"\u2192"} [L, 1, 2] {"\u2192"} [C, 2, 0] {"\u2192"} END
          </div>
          {/* Header */}
          <div className="flex gap-1 mb-1">
            {["type", "node_a", "node_b", "value"].map((h) => (
              <div key={h} className="w-14 text-center text-[9px] font-mono" style={{ color: colors.gray }}>{h}</div>
            ))}
          </div>
          {/* Token rows */}
          {exampleTokens.map((tok, i) => (
            <motion.div key={i} className="flex gap-1 mb-0.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}>
              <div className="w-14 text-center text-xs font-mono font-bold px-1 py-0.5 rounded"
                style={{ background: `${tok.color}15`, color: tok.color }}>
                {tok.type}({tok.typeId})
              </div>
              <div className="w-14 text-center text-xs font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.03)", color: colors.white }}>
                {tok.nodeA}
              </div>
              <div className="w-14 text-center text-xs font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.03)", color: colors.white }}>
                {tok.nodeB}
              </div>
              <div className="w-14 text-center text-xs font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.03)", color: colors.white }}>
                {tok.value}
              </div>
            </motion.div>
          ))}
          <div className="text-[9px] font-mono mt-2" style={{ color: colors.gray }}>
            R=500{"\u03A9"} entre 0-1, L=100{"\u00B5"}H entre 1-2, C=10nF entre 2-0
          </div>
        </motion.div>

        {/* Right: Properties + Normalization */}
        <div className="flex flex-col gap-3" style={{ width: 320 }}>
          {/* Token format */}
          <motion.div variants={fadeUp}
            className="p-4 rounded-2xl border"
            style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}>
            <div className="text-xs font-mono mb-2" style={{ color: colors.grayLight }}>Structure d{"'"}un token</div>
            <div className="flex gap-2">
              {[
                { label: "TYPE", desc: "R, L, ou C", color: colors.blue },
                { label: "NODE_A", desc: "N\u0153ud 0-7", color: colors.cyan },
                { label: "NODE_B", desc: "N\u0153ud 0-7", color: colors.green },
                { label: "VALEUR", desc: "Normalis\u00e9e", color: colors.yellow },
              ].map((f) => (
                <motion.div key={f.label} variants={fadeUp}
                  className="flex flex-col items-center px-2 py-2 rounded-lg flex-1"
                  style={{ background: `${f.color}08`, border: `1px solid ${f.color}20` }}>
                  <div className="text-[9px] font-mono font-bold" style={{ color: f.color }}>{f.label}</div>
                  <div className="text-[8px] mt-0.5" style={{ color: colors.gray }}>{f.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Value normalization */}
          <motion.div variants={fadeUp}
            className="p-4 rounded-2xl border"
            style={{ borderColor: `${colors.yellow}20`, background: `${colors.yellow}05` }}>
            <div className="text-xs font-mono mb-2" style={{ color: colors.yellow }}>Normalisation des valeurs</div>
            <div className="flex flex-col gap-1.5">
              {[
                { comp: "R", formula: "log10(R) - 3", example: "500\u03A9 \u2192 2.7 - 3 = -0.3", color: colors.resistor },
                { comp: "L", formula: "log10(L) + 4", example: "100\u00B5H \u2192 -4.0 + 4 = 0", color: colors.inductor },
                { comp: "C", formula: "log10(C) + 8", example: "10nF \u2192 -8.0 + 8 = 0", color: colors.capacitor },
              ].map((n) => (
                <motion.div key={n.comp} variants={fadeUp}
                  className="flex items-center gap-2 text-[10px]">
                  <span className="font-mono font-bold w-4" style={{ color: n.color }}>{n.comp}</span>
                  <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)", color: colors.white }}>{n.formula}</span>
                  <span style={{ color: colors.gray }}>{n.example}</span>
                </motion.div>
              ))}
            </div>
            <motion.div className="mt-2 text-[9px] font-mono px-2 py-1 rounded"
              style={{ background: `${colors.yellow}10`, color: colors.yellow }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
              Toutes les valeurs normalis{"\u00e9"}es entre -4 et +4
            </motion.div>
          </motion.div>

          {/* Advantages */}
          <motion.div variants={fadeUp}
            className="p-3 rounded-xl border"
            style={{ borderColor: `${colors.green}20`, background: `${colors.green}05` }}>
            <motion.div variants={staggerFast} className="flex flex-col gap-1 text-[10px]" style={{ color: colors.grayLight }}>
              {[
                "Taille fixe (24 nombres) \u2192 batch GPU",
                "Ordonn\u00e9e \u2192 compatible Transformer auto-r\u00e9gressif",
                "Padding (type=0) ignor\u00e9 par le mod\u00e8le",
                "Contrainte node_b \u2260 node_a int\u00e9gr\u00e9e au d\u00e9codeur",
              ].map((adv, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-1.5">
                  <Check size={10} style={{ color: colors.green }} />
                  <span>{adv}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
