"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

export default function GpuOptimSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Optimisation
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Optimisation GPU
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-10" style={{ color: colors.grayLight }}>
        Vectorisation du solveur MNA : élimination des boucles Python
      </motion.p>

      <div className="flex items-center gap-8">
        {/* Before */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-6 rounded-2xl border"
          style={{ borderColor: `${colors.resistor}25`, background: `${colors.resistor}04`, width: 300 }}>
          <div className="text-xs font-mono mb-4" style={{ color: colors.resistor }}>AVANT — Boucles Python</div>

          {/* Fake code block */}
          <div className="font-mono text-[11px] p-3 rounded-lg w-full" style={{ background: "rgba(0,0,0,0.3)", color: colors.grayLight }}>
            <div><span style={{ color: colors.purple }}>for</span> b <span style={{ color: colors.purple }}>in</span> range(batch):</div>
            <div>&nbsp;&nbsp;<span style={{ color: colors.purple }}>for</span> s <span style={{ color: colors.purple }}>in</span> range(seq):</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: colors.purple }}>for</span> f <span style={{ color: colors.purple }}>in</span> range(freq):</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y[b,f,i,j] += ...</div>
          </div>

          {/* Speed bar */}
          <div className="w-full mt-5">
            <div className="text-xs font-mono mb-1" style={{ color: colors.resistor }}>Solver: 1700ms / batch</div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div className="h-full rounded-full" style={{ background: colors.resistor }}
                initial={{ width: 0 }} animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1 }} />
            </div>
          </div>

          <div className="mt-3 text-2xl font-bold font-mono" style={{ color: colors.resistor }}>~14h</div>
          <div className="text-xs" style={{ color: colors.gray }}>pour 100 epochs</div>
        </motion.div>

        {/* Arrow with speedup */}
        <motion.div className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: "spring" }}>
          <motion.div className="text-3xl font-bold font-mono" style={{ color: colors.green }}
            animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            340×
          </motion.div>
          <svg width="60" height="20">
            <motion.line x1="5" y1="10" x2="45" y2="10" stroke={colors.green} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.7, duration: 0.4 }} />
            <motion.polygon points="42,4 55,10 42,16" fill={colors.green}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} />
          </svg>
          <span className="text-xs font-mono" style={{ color: colors.green }}>speedup</span>
        </motion.div>

        {/* After */}
        <motion.div variants={scaleIn}
          className="flex flex-col items-center p-6 rounded-2xl border"
          style={{ borderColor: `${colors.green}35`, background: `${colors.green}06`, width: 300 }}>
          <div className="text-xs font-mono mb-4" style={{ color: colors.green }}>APRÈS — Vectorisé</div>

          {/* Fake code block */}
          <div className="font-mono text-[11px] p-3 rounded-lg w-full" style={{ background: "rgba(0,0,0,0.3)", color: colors.grayLight }}>
            <div>omega = 2π * freqs</div>
            <div>Y_R = 1.0 / R_values</div>
            <div>Y_L = -1.0 / (omega * L)</div>
            <div>{"Y.index_put_(idx, val, "}<span style={{ color: colors.green }}>acc=True</span>{")"}</div>
          </div>

          {/* Speed bar */}
          <div className="w-full mt-5">
            <div className="text-xs font-mono mb-1" style={{ color: colors.green }}>Solver: 5ms / batch</div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div className="h-full rounded-full" style={{ background: colors.green }}
                initial={{ width: 0 }} animate={{ width: "0.3%" }}
                transition={{ delay: 1.2, duration: 0.5 }} />
            </div>
          </div>

          <motion.div className="mt-3 text-2xl font-bold font-mono" style={{ color: colors.green }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.2, type: "spring" }}>
            ~2.5h
          </motion.div>
          <div className="text-xs" style={{ color: colors.gray }}>pour 100 epochs</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
