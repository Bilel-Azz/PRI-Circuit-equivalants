"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

/* ── Animated curve helper ── */
function MiniCurve({ path, color, delay }: { path: string; color: string; delay: number }) {
  return (
    <motion.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay, duration: 0.8, ease: "easeInOut" }}
    />
  );
}

export default function PourquoiTemplatesSlide() {
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
          03 — Génération
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Pourquoi des templates ?
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-8"
        style={{ color: colors.grayLight }}
      >
        Fixer la topologie, randomiser les valeurs
      </motion.p>

      {/* Two-column comparison */}
      <div className="flex gap-6 w-full max-w-5xl mb-6">
        {/* LEFT: Random = bad */}
        <motion.div
          variants={fadeUp}
          className="flex-1 p-5 rounded-2xl border"
          style={{
            borderColor: `${colors.resistor}25`,
            background: `${colors.resistor}04`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${colors.resistor}20`, color: colors.resistor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              {"\u2717"}
            </motion.div>
            <span className="text-base font-bold" style={{ color: colors.resistor }}>
              Génération aléatoire
            </span>
          </div>

          {/* Chart: similar curves */}
          <div className="rounded-xl p-3 mb-4" style={{ background: colors.bg }}>
            <svg viewBox="0 0 240 110" className="w-full">
              <line x1="25" y1="90" x2="225" y2="90" stroke={colors.grayDark} strokeWidth="0.5" />
              <line x1="25" y1="10" x2="25" y2="90" stroke={colors.grayDark} strokeWidth="0.5" />
              <text x="125" y="105" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace">log(f)</text>
              <text x="12" y="55" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace" transform="rotate(-90, 12, 55)">log|Z|</text>

              {/* All similar monotone curves */}
              <MiniCurve path="M 30,20 C 70,25 130,50 170,62 C 195,70 210,75 220,78" color={`${colors.gray}90`} delay={0.6} />
              <MiniCurve path="M 30,26 C 70,30 130,54 170,65 C 195,72 210,77 220,80" color={`${colors.gray}70`} delay={0.75} />
              <MiniCurve path="M 30,16 C 70,20 130,46 170,58 C 195,66 210,72 220,75" color={`${colors.gray}80`} delay={0.9} />
              <MiniCurve path="M 30,32 C 70,35 130,52 170,60 C 195,65 210,69 220,72" color={`${colors.gray}60`} delay={1.05} />
              <MiniCurve path="M 30,24 C 70,28 130,48 170,60 C 195,68 210,73 220,76" color={`${colors.gray}50`} delay={1.15} />

              <motion.text x="130" y="24" textAnchor="middle" fill={colors.resistor} fontSize="10" fontFamily="monospace" fontWeight="bold"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                Toutes similaires !
              </motion.text>
            </svg>
          </div>

          <div className="flex flex-col gap-2 text-sm" style={{ color: colors.grayLight }}>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: colors.resistor }} />
              80% de courbes monotones (RC, RL)
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: colors.resistor }} />
              {"<"}15% de résonances par hasard
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: colors.resistor }} />
              Aucun contrôle sur la distribution
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Templates = good */}
        <motion.div
          variants={fadeUp}
          className="flex-1 p-5 rounded-2xl border"
          style={{
            borderColor: `${colors.green}25`,
            background: `${colors.green}04`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${colors.green}20`, color: colors.green }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {"\u2713"}
            </motion.div>
            <span className="text-base font-bold" style={{ color: colors.green }}>
              Topologies prédéfinies
            </span>
          </div>

          {/* Chart: diverse curves */}
          <div className="rounded-xl p-3 mb-4" style={{ background: colors.bg }}>
            <svg viewBox="0 0 240 110" className="w-full">
              <line x1="25" y1="90" x2="225" y2="90" stroke={colors.grayDark} strokeWidth="0.5" />
              <line x1="25" y1="10" x2="25" y2="90" stroke={colors.grayDark} strokeWidth="0.5" />
              <text x="125" y="105" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace">log(f)</text>
              <text x="12" y="55" textAnchor="middle" fill={colors.gray} fontSize="8" fontFamily="monospace" transform="rotate(-90, 12, 55)">log|Z|</text>

              {/* Diverse curves */}
              <MiniCurve path="M 30,18 C 60,24 90,55 120,72 C 150,55 180,24 220,15" color={colors.cyan} delay={0.6} />
              <MiniCurve path="M 30,72 C 60,66 95,36 120,15 C 145,36 180,66 220,72" color={colors.blue} delay={0.8} />
              <MiniCurve path="M 30,20 C 45,30 55,52 70,62 C 82,50 92,28 108,20 C 120,30 140,52 155,62 C 170,48 190,22 220,16" color={colors.purple} delay={1.0} />
              <MiniCurve path="M 30,42 C 52,38 70,55 88,72 C 100,52 110,24 128,15 C 155,30 190,42 220,46" color={colors.orange} delay={1.2} />

              {/* Legend */}
              {[
                { y: 15, label: "RLC", color: colors.cyan },
                { y: 25, label: "Tank", color: colors.blue },
                { y: 35, label: "Double", color: colors.purple },
                { y: 45, label: "Notch", color: colors.orange },
              ].map((l) => (
                <motion.g key={l.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  <line x1="170" y1={l.y} x2="185" y2={l.y} stroke={l.color} strokeWidth="1.5" />
                  <text x="189" y={l.y + 3} fill={l.color} fontSize="7" fontFamily="monospace">{l.label}</text>
                </motion.g>
              ))}
            </svg>
          </div>

          <div className="flex flex-col gap-2 text-sm" style={{ color: colors.grayLight }}>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: colors.green }} />
              Chaque template {"→"} forme Z(f) <span style={{ color: colors.green }}>unique</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: colors.green }} />
              Distribution contrôlée (20/55/25%)
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: colors.green }} />
              Valeurs aléatoires dans chaque template
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom: The concept */}
      <motion.div
        className="w-full max-w-5xl px-6 py-4 rounded-xl border"
        style={{ borderColor: `${colors.green}30`, background: `${colors.green}08` }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm" style={{ color: colors.green }}>
            {"Principe : "}
            <span className="font-bold">fixer la topologie</span>
            {" (structure du circuit) et ne randomiser que les "}
            <span className="font-bold">valeurs des composants</span>
            {" → contrôle de la forme des courbes tout en gardant la diversité"}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
