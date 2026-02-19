"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, slideRight, staggerContainer, staggerFast } from "@/lib/animations";
import { colors } from "@/lib/theme";

const vectorData = [
  { type: "SERIES", parent: "-1", value: "0", color: colors.yellow },
  { type: "R", parent: "0", value: "2.0", color: colors.resistor },
  { type: "PARALLEL", parent: "0", value: "0", color: colors.yellow },
  { type: "L", parent: "2", value: "-2.0", color: colors.inductor },
  { type: "C", parent: "2", value: "-6.0", color: colors.capacitor },
  { type: "NONE", parent: "0", value: "0", color: colors.gray },
];

// Mini impedance curve for illustration
function miniCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = t * 120;
    const y = 30 - 20 * Math.exp(-((t - 0.4) ** 2) / 0.02) + 5 * Math.sin(t * 15);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function DataEncodingSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        variants={fadeUp}
        className="text-5xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Encodage des donn&eacute;es
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-lg mb-10"
        style={{ color: colors.grayLight }}
      >
        Circuit &rarr; Vecteur fixe de 48 nombres
      </motion.p>

      <div className="flex items-center gap-12">
        {/* Left: Circuit tree */}
        <motion.div
          variants={slideRight}
          className="flex flex-col items-center p-6 rounded-2xl border"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        >
          <div className="text-sm font-mono mb-4" style={{ color: colors.grayLight }}>
            Circuit Hierarchique
          </div>

          {/* Simple tree visualization */}
          <svg width="200" height="160" viewBox="0 0 200 160">
            {/* Lines */}
            <motion.line x1="100" y1="25" x2="50" y2="65" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
            <motion.line x1="100" y1="25" x2="150" y2="65" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
            <motion.line x1="150" y1="65" x2="120" y2="120" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.5 }} />
            <motion.line x1="150" y1="65" x2="175" y2="120" stroke={colors.grayDark} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.5 }} />

            {/* Nodes */}
            {[
              { x: 100, y: 20, label: "S", color: colors.yellow, delay: 0.3 },
              { x: 50, y: 70, label: "R", color: colors.resistor, delay: 0.7 },
              { x: 150, y: 70, label: "P", color: colors.yellow, delay: 0.8 },
              { x: 120, y: 125, label: "L", color: colors.inductor, delay: 1.0 },
              { x: 175, y: 125, label: "C", color: colors.capacitor, delay: 1.1 },
            ].map((node) => (
              <motion.g key={node.label + node.x}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: node.delay, type: "spring", damping: 12 }}
              >
                <circle cx={node.x} cy={node.y} r="16" fill={`${node.color}25`} stroke={node.color} strokeWidth="1.5" />
                <text x={node.x} y={node.y + 5} textAnchor="middle" fill={node.color} fontSize="13" fontWeight="bold" fontFamily="monospace">
                  {node.label}
                </text>
              </motion.g>
            ))}
          </svg>

          {/* Mini curve */}
          <div className="mt-3">
            <svg width="120" height="40" viewBox="0 0 120 40">
              <motion.path
                d={miniCurve()}
                fill="none" stroke={colors.cyan} strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.3, duration: 1 }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
        >
          <div className="text-4xl" style={{ color: colors.blue }}>&rarr;</div>
          <div className="text-xs font-mono" style={{ color: colors.gray }}>
            encode
          </div>
        </motion.div>

        {/* Right: Vector table */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        >
          <div className="px-4 py-2 text-sm font-mono border-b" style={{ borderColor: colors.border, color: colors.grayLight }}>
            Fixed-Size Vector (16 &times; 3)
          </div>
          <motion.div className="p-3" variants={staggerFast}>
            {vectorData.map((row, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="flex gap-2 items-center font-mono text-sm py-1.5 px-2 rounded"
                style={{
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                }}
              >
                <span className="w-6 text-right" style={{ color: colors.gray, fontSize: 10 }}>
                  {i}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    background: `${row.color}20`,
                    color: row.color,
                    minWidth: 72,
                    textAlign: "center",
                  }}
                >
                  {row.type}
                </span>
                <span style={{ color: colors.grayLight, width: 32, textAlign: "center" }}>
                  {row.parent}
                </span>
                <span style={{ color: colors.white, width: 40, textAlign: "right" }}>
                  {row.value}
                </span>
              </motion.div>
            ))}
            <motion.div
              variants={fadeUp}
              className="text-center text-xs py-1 mt-1"
              style={{ color: colors.gray }}
            >
              ... (pad to 16 nodes)
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Format note */}
      <motion.div
        className="mt-8 font-mono text-sm"
        style={{ color: colors.grayLight }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        [Type_ID, Parent_Index, Value] &times; 16 = <span style={{ color: colors.cyan }}>48 nombres</span>
      </motion.div>
    </motion.div>
  );
}
