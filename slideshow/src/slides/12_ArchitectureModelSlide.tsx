"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

export default function ArchitectureModelSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Architecture
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-8" style={{ color: colors.white }}>
        Architecture du modèle
      </motion.h2>

      {/* Neural network diagram */}
      <motion.div variants={fadeUp} className="relative">
        <svg width="920" height="340" viewBox="0 0 920 340">
          {/* ===== INPUT ===== */}
          <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <rect x="10" y="90" width="100" height="140" rx="12" fill={`${colors.cyan}10`} stroke={colors.cyan} strokeWidth="1.5" />
            <text x="60" y="55" textAnchor="middle" fill={colors.cyan} fontSize="12" fontFamily="monospace">Input Z(f)</text>
            <text x="60" y="73" textAnchor="middle" fill={colors.gray} fontSize="10" fontFamily="monospace">(2, 100)</text>
            {/* Mini curve inside */}
            <motion.path d="M22,160 Q45,120 60,140 Q75,165 98,125" fill="none" stroke={colors.cyan} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.8 }} />
            {/* Channel labels */}
            <text x="60" y="195" textAnchor="middle" fill={colors.gray} fontSize="9" fontFamily="monospace">log|Z|</text>
            <text x="60" y="208" textAnchor="middle" fill={colors.gray} fontSize="9" fontFamily="monospace">phase</text>
          </motion.g>

          {/* ===== ARROW 1 ===== */}
          <motion.line x1="115" y1="160" x2="155" y2="160" stroke={colors.grayDark} strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.3 }} />

          {/* ===== ENCODER CNN ===== */}
          <motion.g initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, type: "spring" }}>
            <rect x="160" y="40" width="200" height="240" rx="12" fill={`${colors.blue}08`} stroke={colors.blue} strokeWidth="1.5" />
            <text x="260" y="28" textAnchor="middle" fill={colors.blue} fontSize="12" fontWeight="bold" fontFamily="monospace">Encoder CNN</text>

            {/* Conv1d layers - trapezoid shape showing channel increase */}
            {[
              { y: 60, w: 160, label: "Conv1d(2→64, k=5)", sub: "+BN+ReLU+Pool" },
              { y: 105, w: 140, label: "Conv1d(64→128, k=5)", sub: "+BN+ReLU+Pool" },
              { y: 150, w: 120, label: "Conv1d(128→256, k=3)", sub: "+BN+ReLU+Pool" },
            ].map((layer, i) => (
              <motion.g key={i} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.0 + i * 0.15, type: "spring" }}>
                <rect x={260 - layer.w / 2} y={layer.y} width={layer.w} height="30" rx="6"
                  fill={`${colors.blue}18`} stroke={colors.blue} strokeWidth="0.8" />
                <text x="260" y={layer.y + 14} textAnchor="middle" fill={colors.blue} fontSize="9" fontWeight="bold" fontFamily="monospace">{layer.label}</text>
                <text x="260" y={layer.y + 25} textAnchor="middle" fill={colors.gray} fontSize="7" fontFamily="monospace">{layer.sub}</text>
              </motion.g>
            ))}

            {/* MLP head */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              <rect x="200" y="195" width="120" height="22" rx="5"
                fill={`${colors.purple}15`} stroke={colors.purple} strokeWidth="0.8" />
              <text x="260" y="210" textAnchor="middle" fill={colors.purple} fontSize="9" fontFamily="monospace">MLP 3072→512→256</text>
            </motion.g>

            {/* Flatten arrow */}
            <motion.text x="260" y="188" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.45 }}>flatten</motion.text>

            <text x="260" y="245" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace">MaxPool1d(2) x3</text>
            <text x="260" y="270" textAnchor="middle" fill={colors.grayLight} fontSize="8" fontStyle="italic">Extrait les features de Z(f)</text>
          </motion.g>

          {/* ===== ARROW 2 ===== */}
          <motion.line x1="365" y1="160" x2="400" y2="160" stroke={colors.grayDark} strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.7, duration: 0.3 }} />

          {/* ===== LATENT ===== */}
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, type: "spring" }}>
            <circle cx="425" cy="160" r="25" fill={`${colors.purple}15`} stroke={colors.purple} strokeWidth="1.5" />
            <text x="425" y="164" textAnchor="middle" fill={colors.purple} fontSize="10" fontWeight="bold" fontFamily="monospace">256</text>
            <text x="425" y="200" textAnchor="middle" fill={colors.gray} fontSize="9" fontFamily="monospace">latent</text>
            <text x="425" y="215" textAnchor="middle" fill={colors.grayLight} fontSize="7" fontStyle="italic">Représentation</text>
            <text x="425" y="225" textAnchor="middle" fill={colors.grayLight} fontSize="7" fontStyle="italic">compressée</text>
          </motion.g>

          {/* ===== ARROW TO DECODER ===== */}
          <motion.line x1="450" y1="160" x2="495" y2="160" stroke={colors.grayDark} strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.0, duration: 0.3 }} />

          {/* ===== TRANSFORMER DECODER ===== */}
          <motion.g initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1, type: "spring" }}>
            <rect x="500" y="55" width="200" height="210" rx="12" fill={`${colors.green}06`} stroke={colors.green} strokeWidth="1.5" />
            <text x="600" y="42" textAnchor="middle" fill={colors.green} fontSize="11" fontWeight="bold" fontFamily="monospace">Transformer Decoder</text>

            {/* Decoder layers */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.g key={i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.3 + i * 0.08, type: "spring" }}>
                <rect x="515" y={70 + i * 30} width="170" height="22" rx="5"
                  fill={`${colors.green}12`} stroke={colors.green} strokeWidth="0.5" />
                <text x="600" y={84 + i * 30} textAnchor="middle" fill={colors.green} fontSize="8" fontFamily="monospace">
                  {`Layer ${i + 1}: 8-head attn + FFN`}
                </text>
              </motion.g>
            ))}

            <text x="600" y="258" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace">d=512, h=8, ff=2048</text>
            <text x="600" y="275" textAnchor="middle" fill={colors.grayLight} fontSize="8" fontStyle="italic">Génère séquentiellement</text>
            <text x="600" y="287" textAnchor="middle" fill={colors.grayLight} fontSize="8" fontStyle="italic">les composants</text>
          </motion.g>

          {/* ===== ARROW TO OUTPUT ===== */}
          <motion.line x1="705" y1="160" x2="740" y2="160" stroke={colors.grayDark} strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.8, duration: 0.3 }} />

          {/* ===== OUTPUT: 6 STEPS ===== */}
          <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.9, type: "spring" }}>
            <rect x="745" y="65" width="160" height="190" rx="12" fill={`${colors.orange}06`} stroke={colors.orange} strokeWidth="1.5" />
            <text x="825" y="55" textAnchor="middle" fill={colors.orange} fontSize="11" fontWeight="bold" fontFamily="monospace">Output</text>

            {[
              { label: "type", desc: "R/L/C/None", color: colors.resistor },
              { label: "node_a", desc: "0-3", color: colors.cyan },
              { label: "node_b", desc: "masqué", color: colors.green },
              { label: "value", desc: "log10", color: colors.yellow },
            ].map((out, i) => (
              <motion.g key={out.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 3.1 + i * 0.1 }}>
                <text x="770" y={92 + i * 26} fill={out.color} fontSize="9" fontWeight="bold" fontFamily="monospace">{out.label}</text>
                <text x="840" y={92 + i * 26} fill={colors.gray} fontSize="8" fontFamily="monospace">{out.desc}</text>
              </motion.g>
            ))}

            <text x="825" y="200" textAnchor="middle" fill={colors.grayLight} fontSize="8" fontFamily="monospace">x6 steps (composants)</text>

            {/* Constraint badge */}
            <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.5, type: "spring" }}>
              <rect x="765" y="215" width="120" height="24" rx="6"
                fill={`${colors.green}15`} stroke={colors.green} strokeWidth="1" />
              <text x="825" y="231" textAnchor="middle" fill={colors.green} fontSize="8" fontWeight="bold" fontFamily="monospace">node_b ≠ node_a</text>
            </motion.g>
          </motion.g>

          {/* Stats bar */}
          <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.8 }}>
            {[
              { x: 210, label: "27.7M", sub: "params" },
              { x: 370, label: "6", sub: "layers" },
              { x: 510, label: "8", sub: "heads" },
              { x: 660, label: "~2s", sub: "inference" },
            ].map((stat) => (
              <g key={stat.label}>
                <text x={stat.x} y="320" textAnchor="middle" fill={colors.blue} fontSize="13" fontWeight="bold" fontFamily="monospace">{stat.label}</text>
                <text x={stat.x} y="334" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace">{stat.sub}</text>
              </g>
            ))}
          </motion.g>

          {/* Data flow particles */}
          {[0, 1, 2].map((i) => (
            <motion.circle key={`p${i}`} r="3" fill={colors.cyan}
              initial={{ cx: 110, cy: 160, opacity: 0 }}
              animate={{ cx: [110, 260, 425, 600, 825], cy: [160, 160, 160, 160, 160], opacity: [0, 1, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 4 + i * 1, ease: "linear" }} />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
}
