"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

const normRules = [
  { type: "R", formula: "log₁₀(R) − 3", example: "100Ω → −1.0", color: colors.resistor },
  { type: "L", formula: "log₁₀(L) + 4", example: "10mH → 0.0", color: colors.inductor },
  { type: "C", formula: "log₁₀(C) + 8", example: "1µF → 2.0", color: colors.capacitor },
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
        className="text-sm mb-5"
        style={{ color: colors.grayLight }}
      >
        Chaque composant = un token de 4 valeurs
      </motion.p>

      {/* ====== MAIN VISUAL: Circuit → Tokens ====== */}
      <motion.div variants={fadeUp} className="w-full max-w-5xl mb-4">
        <svg width="100%" viewBox="0 0 920 240">
          {/* === LEFT: Circuit schematic === */}
          <text x="175" y="16" textAnchor="middle" fill={colors.gray} fontSize="10" fontFamily="monospace">
            Circuit RLC série
          </text>

          {/* Node 0 (IN) */}
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <circle cx="28" cy="65" r="10" fill={`${colors.cyan}15`} stroke={colors.cyan} strokeWidth="1.2" />
            <text x="28" y="69" textAnchor="middle" fill={colors.cyan} fontSize="11" fontWeight="bold" fontFamily="monospace">0</text>
            <text x="28" y="50" textAnchor="middle" fill={colors.cyan} fontSize="8" fontFamily="monospace">IN</text>
          </motion.g>

          {/* Wire → R */}
          <line x1="38" y1="65" x2="55" y2="65" stroke={colors.grayDark} strokeWidth="1.2" />

          {/* R component */}
          <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring" }}>
            <rect x="55" y="50" width="65" height="30" rx="6" fill={`${colors.resistor}12`} stroke={colors.resistor} strokeWidth="1.2" />
            <text x="87" y="63" textAnchor="middle" fill={colors.resistor} fontSize="9" fontWeight="bold" fontFamily="monospace">R</text>
            <text x="87" y="75" textAnchor="middle" fill={`${colors.resistor}90`} fontSize="8" fontFamily="monospace">100Ω</text>
          </motion.g>

          {/* Wire → Node 1 */}
          <line x1="120" y1="65" x2="137" y2="65" stroke={colors.grayDark} strokeWidth="1.2" />

          {/* Node 1 */}
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, type: "spring" }}>
            <circle cx="147" cy="65" r="10" fill={`${colors.cyan}15`} stroke={colors.cyan} strokeWidth="1.2" />
            <text x="147" y="69" textAnchor="middle" fill={colors.cyan} fontSize="11" fontWeight="bold" fontFamily="monospace">1</text>
          </motion.g>

          {/* Wire → L */}
          <line x1="157" y1="65" x2="172" y2="65" stroke={colors.grayDark} strokeWidth="1.2" />

          {/* L component */}
          <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
            <rect x="172" y="50" width="65" height="30" rx="6" fill={`${colors.inductor}12`} stroke={colors.inductor} strokeWidth="1.2" />
            <text x="204" y="63" textAnchor="middle" fill={colors.inductor} fontSize="9" fontWeight="bold" fontFamily="monospace">L</text>
            <text x="204" y="75" textAnchor="middle" fill={`${colors.inductor}90`} fontSize="8" fontFamily="monospace">10mH</text>
          </motion.g>

          {/* Wire → Node 2 */}
          <line x1="237" y1="65" x2="253" y2="65" stroke={colors.grayDark} strokeWidth="1.2" />

          {/* Node 2 */}
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55, type: "spring" }}>
            <circle cx="263" cy="65" r="10" fill={`${colors.cyan}15`} stroke={colors.cyan} strokeWidth="1.2" />
            <text x="263" y="69" textAnchor="middle" fill={colors.cyan} fontSize="11" fontWeight="bold" fontFamily="monospace">2</text>
          </motion.g>

          {/* Wire → C */}
          <line x1="273" y1="65" x2="288" y2="65" stroke={colors.grayDark} strokeWidth="1.2" />

          {/* C component */}
          <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: "spring" }}>
            <rect x="288" y="50" width="65" height="30" rx="6" fill={`${colors.capacitor}12`} stroke={colors.capacitor} strokeWidth="1.2" />
            <text x="320" y="63" textAnchor="middle" fill={colors.capacitor} fontSize="9" fontWeight="bold" fontFamily="monospace">C</text>
            <text x="320" y="75" textAnchor="middle" fill={`${colors.capacitor}90`} fontSize="8" fontFamily="monospace">1µF</text>
          </motion.g>

          {/* Wire → Node 3 */}
          <line x1="353" y1="65" x2="368" y2="65" stroke={colors.grayDark} strokeWidth="1.2" />

          {/* Node 3 (GND) */}
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65, type: "spring" }}>
            <circle cx="378" cy="65" r="10" fill={`${colors.purple}15`} stroke={colors.purple} strokeWidth="1.2" />
            <text x="378" y="69" textAnchor="middle" fill={colors.purple} fontSize="11" fontWeight="bold" fontFamily="monospace">3</text>
            <text x="378" y="50" textAnchor="middle" fill={colors.purple} fontSize="8" fontFamily="monospace">GND</text>
          </motion.g>

          {/* === CENTER: Big animated arrow === */}
          <motion.g
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
          >
            <line x1="410" y1="115" x2="460" y2="115" stroke={colors.green} strokeWidth="2.5" />
            <polygon points="460,107 478,115 460,123" fill={colors.green} />
            <text x="444" y="100" textAnchor="middle" fill={colors.green} fontSize="10" fontWeight="bold" fontFamily="monospace">
              tokenisation
            </text>
          </motion.g>

          {/* === RIGHT: Token blocks === */}

          {/* Column headers */}
          <text x="522" y="28" textAnchor="middle" fill={colors.gray} fontSize="9" fontFamily="monospace">type</text>
          <text x="600" y="28" textAnchor="middle" fill={colors.gray} fontSize="9" fontFamily="monospace">node_a</text>
          <text x="678" y="28" textAnchor="middle" fill={colors.gray} fontSize="9" fontFamily="monospace">node_b</text>
          <text x="775" y="28" textAnchor="middle" fill={colors.gray} fontSize="9" fontFamily="monospace">valeur normalisée</text>

          {/* Token 1: R */}
          <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, type: "spring" }}>
            <rect x="490" y="38" width="65" height="36" rx="7" fill={`${colors.resistor}18`} stroke={colors.resistor} strokeWidth="1.2" />
            <text x="522" y="61" textAnchor="middle" fill={colors.resistor} fontSize="15" fontWeight="bold" fontFamily="monospace">R</text>

            <rect x="568" y="38" width="65" height="36" rx="7" fill={`${colors.cyan}10`} stroke={`${colors.cyan}35`} strokeWidth="1" />
            <text x="600" y="61" textAnchor="middle" fill={colors.cyan} fontSize="15" fontFamily="monospace">0</text>

            <rect x="646" y="38" width="65" height="36" rx="7" fill={`${colors.purple}10`} stroke={`${colors.purple}35`} strokeWidth="1" />
            <text x="678" y="61" textAnchor="middle" fill={colors.purple} fontSize="15" fontFamily="monospace">1</text>

            <rect x="724" y="38" width="100" height="36" rx="7" fill={`${colors.green}08`} stroke={`${colors.green}25`} strokeWidth="1" />
            <text x="774" y="61" textAnchor="middle" fill={colors.green} fontSize="15" fontFamily="monospace">-1.0</text>
          </motion.g>

          {/* Token 2: L */}
          <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0, type: "spring" }}>
            <rect x="490" y="82" width="65" height="36" rx="7" fill={`${colors.inductor}18`} stroke={colors.inductor} strokeWidth="1.2" />
            <text x="522" y="105" textAnchor="middle" fill={colors.inductor} fontSize="15" fontWeight="bold" fontFamily="monospace">L</text>

            <rect x="568" y="82" width="65" height="36" rx="7" fill={`${colors.cyan}10`} stroke={`${colors.cyan}35`} strokeWidth="1" />
            <text x="600" y="105" textAnchor="middle" fill={colors.cyan} fontSize="15" fontFamily="monospace">1</text>

            <rect x="646" y="82" width="65" height="36" rx="7" fill={`${colors.purple}10`} stroke={`${colors.purple}35`} strokeWidth="1" />
            <text x="678" y="105" textAnchor="middle" fill={colors.purple} fontSize="15" fontFamily="monospace">2</text>

            <rect x="724" y="82" width="100" height="36" rx="7" fill={`${colors.green}08`} stroke={`${colors.green}25`} strokeWidth="1" />
            <text x="774" y="105" textAnchor="middle" fill={colors.green} fontSize="15" fontFamily="monospace">0.0</text>
          </motion.g>

          {/* Token 3: C */}
          <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, type: "spring" }}>
            <rect x="490" y="126" width="65" height="36" rx="7" fill={`${colors.capacitor}18`} stroke={colors.capacitor} strokeWidth="1.2" />
            <text x="522" y="149" textAnchor="middle" fill={colors.capacitor} fontSize="15" fontWeight="bold" fontFamily="monospace">C</text>

            <rect x="568" y="126" width="65" height="36" rx="7" fill={`${colors.cyan}10`} stroke={`${colors.cyan}35`} strokeWidth="1" />
            <text x="600" y="149" textAnchor="middle" fill={colors.cyan} fontSize="15" fontFamily="monospace">2</text>

            <rect x="646" y="126" width="65" height="36" rx="7" fill={`${colors.purple}10`} stroke={`${colors.purple}35`} strokeWidth="1" />
            <text x="678" y="149" textAnchor="middle" fill={colors.purple} fontSize="15" fontFamily="monospace">3</text>

            <rect x="724" y="126" width="100" height="36" rx="7" fill={`${colors.green}08`} stroke={`${colors.green}25`} strokeWidth="1" />
            <text x="774" y="149" textAnchor="middle" fill={colors.green} fontSize="15" fontFamily="monospace">2.0</text>
          </motion.g>

          {/* Token 4: Padding (dimmed) */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.4 }}>
            <rect x="490" y="170" width="65" height="36" rx="7" fill="none" stroke={colors.grayDark} strokeWidth="0.8" strokeDasharray="4 3" />
            <text x="522" y="193" textAnchor="middle" fill={colors.grayDark} fontSize="13" fontFamily="monospace">—</text>

            <rect x="568" y="170" width="65" height="36" rx="7" fill="none" stroke={colors.grayDark} strokeWidth="0.8" strokeDasharray="4 3" />
            <text x="600" y="193" textAnchor="middle" fill={colors.grayDark} fontSize="13" fontFamily="monospace">—</text>

            <rect x="646" y="170" width="65" height="36" rx="7" fill="none" stroke={colors.grayDark} strokeWidth="0.8" strokeDasharray="4 3" />
            <text x="678" y="193" textAnchor="middle" fill={colors.grayDark} fontSize="13" fontFamily="monospace">—</text>

            <rect x="724" y="170" width="100" height="36" rx="7" fill="none" stroke={colors.grayDark} strokeWidth="0.8" strokeDasharray="4 3" />
            <text x="774" y="193" textAnchor="middle" fill={colors.grayDark} fontSize="13" fontFamily="monospace">—</text>

            <text x="845" y="193" fill={colors.grayDark} fontSize="9" fontFamily="monospace">padding</text>
          </motion.g>

          {/* Dashed connection lines from circuit to tokens */}
          <motion.line x1="87" y1="80" x2="490" y2="56" stroke={`${colors.resistor}25`} strokeWidth="0.8" strokeDasharray="3 3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} />
          <motion.line x1="204" y1="80" x2="490" y2="100" stroke={`${colors.inductor}25`} strokeWidth="0.8" strokeDasharray="3 3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} />
          <motion.line x1="320" y1="80" x2="490" y2="144" stroke={`${colors.capacitor}25`} strokeWidth="0.8" strokeDasharray="3 3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} />

          {/* Bottom badge */}
          <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>
            <rect x="530" y="216" width="260" height="24" rx="8" fill={`${colors.green}08`} stroke={`${colors.green}25`} strokeWidth="1" />
            <text x="660" y="232" textAnchor="middle" fill={colors.green} fontSize="10" fontFamily="monospace" fontWeight="bold">
              6 tokens × 4 valeurs = 24 nombres (taille fixe)
            </text>
          </motion.g>
        </svg>
      </motion.div>

      {/* ====== BOTTOM: Normalization + Advantages ====== */}
      <div className="flex gap-5 w-full max-w-5xl">
        {/* Normalization rules */}
        <motion.div
          className="flex-1 p-3 rounded-xl border"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <div className="text-xs font-mono mb-2" style={{ color: colors.grayLight }}>
            Normalisation des valeurs → tout dans [−4, +4]
          </div>
          {normRules.map((rule) => (
            <div key={rule.type} className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold w-4" style={{ color: rule.color }}>{rule.type}</span>
              <span className="text-[10px] font-mono" style={{ color: colors.grayLight }}>{rule.formula}</span>
              <span className="text-[10px] font-mono" style={{ color: colors.gray }}>{rule.example}</span>
            </div>
          ))}
        </motion.div>

        {/* Advantages */}
        <motion.div
          className="flex-1 p-3 rounded-xl border"
          style={{ borderColor: `${colors.green}25`, background: `${colors.green}06` }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
        >
          <div className="text-xs font-mono mb-2" style={{ color: colors.green }}>
            Avantages
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              "Taille fixe : batch GPU efficace",
              "Padding naturel : type = NONE pour slots vides",
              "Compatible Transformer : séquence ordonnée",
              "Contrainte intégrée : node_b ≠ node_a (masking)",
            ].map((adv, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]" style={{ color: colors.grayLight }}>
                <span style={{ color: colors.green }}>{"✓"}</span>
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
