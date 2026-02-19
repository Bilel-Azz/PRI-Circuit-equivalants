"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

function impedanceCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const x = 10 + t * 180;
    const y = 65 - 45 * Math.exp(-((t - 0.4) ** 2) / 0.01) + 5 * Math.sin(t * 18);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function PipelineMNASlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Pipeline MNA
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Du circuit au tenseur
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        Modified Nodal Analysis : comment calculer Z(f) à partir du circuit
      </motion.p>

      {/* Pipeline: Circuit → MNA → Z(f) → Tensor */}
      <div className="flex items-center gap-4">
        {/* Step 1: Circuit */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-4 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}30`, background: `${colors.cyan}05`, width: 170 }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.cyan }}>1. Circuit</div>
          <svg width="130" height="60" viewBox="0 0 130 60">
            <motion.line x1="5" y1="30" x2="25" y2="30" stroke={colors.grayDark} strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
            <motion.rect x="25" y="20" width="25" height="20" rx="3" fill={`${colors.resistor}20`} stroke={colors.resistor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }} />
            <motion.text x="32" y="34" fill={colors.resistor} fontSize="8" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>R</motion.text>
            <motion.line x1="50" y1="30" x2="70" y2="30" stroke={colors.grayDark} strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
            <motion.rect x="70" y="20" width="25" height="20" rx="3" fill={`${colors.inductor}20`} stroke={colors.inductor} strokeWidth="1"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring" }} />
            <motion.text x="78" y="34" fill={colors.inductor} fontSize="8" fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>L</motion.text>
            <motion.line x1="95" y1="30" x2="125" y2="30" stroke={colors.grayDark} strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1 }} />
          </svg>
          <div className="text-[10px] font-mono" style={{ color: colors.gray }}>composants + nœuds</div>
        </motion.div>

        {/* Arrow */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.blue} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
          </svg>
        </motion.div>

        {/* Step 2: MNA Matrix */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-4 rounded-2xl border"
          style={{ borderColor: `${colors.blue}30`, background: `${colors.blue}05`, width: 200 }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.blue }}>2. Matrice MNA</div>
          {/* Matrix visualization */}
          <div className="flex items-center gap-2">
            <div className="font-mono text-xs" style={{ color: colors.blue }}>[</div>
            <svg width="70" height="70" viewBox="0 0 70 70">
              {/* Grid cells */}
              {[0, 1, 2, 3].map((r) =>
                [0, 1, 2, 3].map((c) => {
                  const hasValue = (r === c) || (r === 0 && c === 1) || (r === 1 && c === 0) || (r === 1 && c === 2) || (r === 2 && c === 1);
                  return (
                    <motion.rect key={`${r}${c}`}
                      x={2 + c * 17} y={2 + r * 17} width="15" height="15" rx="2"
                      fill={hasValue ? `${colors.blue}25` : "rgba(255,255,255,0.02)"}
                      stroke={hasValue ? colors.blue : colors.grayDark} strokeWidth="0.5"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 1.5 + (r * 4 + c) * 0.03, type: "spring" }}
                    />
                  );
                })
              )}
            </svg>
            <div className="font-mono text-xs" style={{ color: colors.blue }}>]</div>
            <div className="text-[10px] ml-1" style={{ color: colors.gray }}>
              <div>Y(f) =</div>
              <div>admittance</div>
              <div>matrix</div>
            </div>
          </div>
          <div className="text-[10px] font-mono mt-2" style={{ color: colors.gray }}>
            {"Y_R = 1/R, Y_L = 1/(jωL)"}
          </div>
          <div className="text-[10px] font-mono" style={{ color: colors.gray }}>
            {"Y_C = jωC"}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.blue} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.1 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} />
          </svg>
        </motion.div>

        {/* Step 3: Z(f) curve */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-4 rounded-2xl border"
          style={{ borderColor: `${colors.green}30`, background: `${colors.green}05`, width: 220 }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.green }}>3. Courbe Z(f)</div>
          <svg width="200" height="80" viewBox="0 0 200 80">
            {/* Axis */}
            <line x1="10" y1="70" x2="190" y2="70" stroke={colors.grayDark} strokeWidth="0.5" />
            <line x1="10" y1="5" x2="10" y2="70" stroke={colors.grayDark} strokeWidth="0.5" />
            {/* Curve */}
            <motion.path d={impedanceCurve()} fill="none" stroke={colors.green} strokeWidth="2.5" strokeLinecap="round"
              variants={drawPath} />
            <motion.path d={impedanceCurve()} fill="none" stroke={colors.green} strokeWidth="8" strokeLinecap="round"
              opacity="0.1" variants={drawPath} />
            {/* Labels */}
            <text x="100" y="78" textAnchor="middle" fill={colors.gray} fontSize="7" fontFamily="monospace">fréquence (Hz)</text>
            <text x="5" y="40" fill={colors.gray} fontSize="7" fontFamily="monospace" transform="rotate(-90, 5, 40)">|Z|</text>
          </svg>
          <div className="text-[10px] font-mono" style={{ color: colors.gray }}>100 fréquences log-spaced</div>
          <div className="text-[10px] font-mono" style={{ color: colors.gray }}>10 Hz → 10 MHz</div>
        </motion.div>

        {/* Arrow */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.blue} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.7 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }} />
          </svg>
        </motion.div>

        {/* Step 4: Tensor */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-4 rounded-2xl border"
          style={{ borderColor: `${colors.purple}30`, background: `${colors.purple}05`, width: 140 }}>
          <div className="text-xs font-mono mb-2" style={{ color: colors.purple }}>4. Tenseur</div>
          <div className="font-mono text-xs p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}>
            <motion.div style={{ color: colors.cyan }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
              [log|Z|, ...]
            </motion.div>
            <motion.div style={{ color: colors.orange }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.1 }}>
              [phase, ...]
            </motion.div>
          </div>
          <motion.div className="text-xs font-mono font-bold mt-2" style={{ color: colors.purple }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>
            (2, 100)
          </motion.div>
          <div className="text-[10px] mt-1" style={{ color: colors.gray }}>input du modèle</div>
        </motion.div>
      </div>

      {/* MNA equation */}
      <motion.div className="mt-8 px-6 py-3 rounded-xl border flex items-center gap-4"
        style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.5 }}>
        <div className="text-xs font-mono" style={{ color: colors.blue }}>MNA</div>
        <div className="text-sm font-mono" style={{ color: colors.white }}>
          Y(f) · V = I → Z(f) = V(IN) / I(IN)
        </div>
        <div className="text-[10px] ml-auto" style={{ color: colors.gray }}>
          Pour chaque fréquence f, résoudre le système linéaire
        </div>
      </motion.div>
    </motion.div>
  );
}
