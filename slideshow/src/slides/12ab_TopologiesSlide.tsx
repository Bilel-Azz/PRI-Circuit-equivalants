"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

/* ── SVG circuit drawing helpers ── */

function Wire({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.grayDark} strokeWidth="0.8" />;
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="1.8" fill={colors.grayLight} />;
}

function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 3} stroke={colors.grayDark} strokeWidth="0.8" />
      <line x1={x - 4} y1={y + 3} x2={x + 4} y2={y + 3} stroke={colors.grayDark} strokeWidth="0.8" />
      <line x1={x - 2.5} y1={y + 5} x2={x + 2.5} y2={y + 5} stroke={colors.grayDark} strokeWidth="0.6" />
      <line x1={x - 1} y1={y + 7} x2={x + 1} y2={y + 7} stroke={colors.grayDark} strokeWidth="0.4" />
    </g>
  );
}

function Comp({ x, y, letter, color }: { x: number; y: number; letter: string; color: string }) {
  return (
    <g>
      <rect x={x - 8} y={y - 5} width="16" height="10" rx="2.5" fill={`${color}25`} stroke={color} strokeWidth="0.7" />
      <text x={x} y={y + 3} textAnchor="middle" fill={color} fontSize="7" fontWeight="bold" fontFamily="monospace">{letter}</text>
    </g>
  );
}

function InLabel({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="2" fill={colors.cyan} />
      <text x={x} y={y - 5} textAnchor="middle" fill={colors.cyan} fontSize="6" fontFamily="monospace">IN</text>
    </g>
  );
}

/* ── Circuit schematics for each topology ── */

function SchematicRLC() {
  // IN ── R ── L ── C ── GND
  return (
    <svg viewBox="0 0 110 40" className="w-full h-9">
      <InLabel x={5} y={20} />
      <Wire x1={7} y1={20} x2={17} y2={20} />
      <Comp x={25} y={20} letter="R" color={colors.resistor} />
      <Wire x1={33} y1={20} x2={42} y2={20} />
      <Comp x={50} y={20} letter="L" color={colors.inductor} />
      <Wire x1={58} y1={20} x2={67} y2={20} />
      <Comp x={75} y={20} letter="C" color={colors.capacitor} />
      <Wire x1={83} y1={20} x2={95} y2={20} />
      <Gnd x={95} y={20} />
    </svg>
  );
}

function SchematicTank() {
  // IN ── R ──┬── L ──┐
  //           │       ├── GND
  //           └── C ──┘
  return (
    <svg viewBox="0 0 110 50" className="w-full h-11">
      <InLabel x={5} y={25} />
      <Wire x1={7} y1={25} x2={15} y2={25} />
      <Comp x={23} y={25} letter="R" color={colors.resistor} />
      <Wire x1={31} y1={25} x2={38} y2={25} />
      <Dot x={38} y={25} />
      {/* Upper branch: L */}
      <Wire x1={38} y1={25} x2={38} y2={12} />
      <Wire x1={38} y1={12} x2={47} y2={12} />
      <Comp x={55} y={12} letter="L" color={colors.inductor} />
      <Wire x1={63} y1={12} x2={75} y2={12} />
      <Wire x1={75} y1={12} x2={75} y2={25} />
      {/* Lower branch: C */}
      <Wire x1={38} y1={25} x2={38} y2={38} />
      <Wire x1={38} y1={38} x2={47} y2={38} />
      <Comp x={55} y={38} letter="C" color={colors.capacitor} />
      <Wire x1={63} y1={38} x2={75} y2={38} />
      <Wire x1={75} y1={38} x2={75} y2={25} />
      {/* To GND */}
      <Dot x={75} y={25} />
      <Wire x1={75} y1={25} x2={90} y2={25} />
      <Gnd x={90} y={25} />
    </svg>
  );
}

function SchematicDouble() {
  // IN ── R ──┬── L₁ ── C₁ ──┐
  //           │               ├── GND
  //           └── L₂ ── C₂ ──┘
  return (
    <svg viewBox="0 0 110 50" className="w-full h-11">
      <InLabel x={4} y={25} />
      <Wire x1={6} y1={25} x2={10} y2={25} />
      <Comp x={17} y={25} letter="R" color={colors.resistor} />
      <Wire x1={25} y1={25} x2={30} y2={25} />
      <Dot x={30} y={25} />
      {/* Upper branch: L1 + C1 */}
      <Wire x1={30} y1={25} x2={30} y2={10} />
      <Wire x1={30} y1={10} x2={35} y2={10} />
      <Comp x={43} y={10} letter="L" color={colors.inductor} />
      <Wire x1={51} y1={10} x2={56} y2={10} />
      <Comp x={64} y={10} letter="C" color={colors.capacitor} />
      <Wire x1={72} y1={10} x2={80} y2={10} />
      <Wire x1={80} y1={10} x2={80} y2={25} />
      {/* Lower branch: L2 + C2 */}
      <Wire x1={30} y1={25} x2={30} y2={40} />
      <Wire x1={30} y1={40} x2={35} y2={40} />
      <Comp x={43} y={40} letter="L" color={colors.inductor} />
      <Wire x1={51} y1={40} x2={56} y2={40} />
      <Comp x={64} y={40} letter="C" color={colors.capacitor} />
      <Wire x1={72} y1={40} x2={80} y2={40} />
      <Wire x1={80} y1={40} x2={80} y2={25} />
      {/* To GND */}
      <Dot x={80} y={25} />
      <Wire x1={80} y1={25} x2={95} y2={25} />
      <Gnd x={95} y={25} />
    </svg>
  );
}

function SchematicNotch() {
  // IN ── R ──┬── L ──┐── R ── GND
  //           └── C ──┘
  return (
    <svg viewBox="0 0 110 50" className="w-full h-11">
      <InLabel x={4} y={25} />
      <Wire x1={6} y1={25} x2={10} y2={25} />
      <Comp x={17} y={25} letter="R" color={colors.resistor} />
      <Wire x1={25} y1={25} x2={32} y2={25} />
      <Dot x={32} y={25} />
      {/* Upper: L */}
      <Wire x1={32} y1={25} x2={32} y2={12} />
      <Wire x1={32} y1={12} x2={40} y2={12} />
      <Comp x={48} y={12} letter="L" color={colors.inductor} />
      <Wire x1={56} y1={12} x2={65} y2={12} />
      <Wire x1={65} y1={12} x2={65} y2={25} />
      {/* Lower: C */}
      <Wire x1={32} y1={25} x2={32} y2={38} />
      <Wire x1={32} y1={38} x2={40} y2={38} />
      <Comp x={48} y={38} letter="C" color={colors.capacitor} />
      <Wire x1={56} y1={38} x2={65} y2={38} />
      <Wire x1={65} y1={38} x2={65} y2={25} />
      {/* R2 to GND */}
      <Dot x={65} y={25} />
      <Wire x1={65} y1={25} x2={72} y2={25} />
      <Comp x={80} y={25} letter="R" color={colors.resistor} />
      <Wire x1={88} y1={25} x2={98} y2={25} />
      <Gnd x={98} y={25} />
    </svg>
  );
}

function SchematicLadder() {
  // IN ── R ── L ──┬── L ──┬── GND
  //                C       C
  //               GND     GND
  return (
    <svg viewBox="0 0 110 50" className="w-full h-11">
      <InLabel x={4} y={14} />
      <Wire x1={6} y1={14} x2={10} y2={14} />
      <Comp x={17} y={14} letter="R" color={colors.resistor} />
      <Wire x1={25} y1={14} x2={30} y2={14} />
      <Comp x={37} y={14} letter="L" color={colors.inductor} />
      <Wire x1={45} y1={14} x2={52} y2={14} />
      <Dot x={52} y={14} />
      {/* Shunt C1 */}
      <Wire x1={52} y1={14} x2={52} y2={26} />
      <Comp x={52} y={33} letter="C" color={colors.capacitor} />
      <Gnd x={52} y={40} />
      {/* Stage 2 */}
      <Wire x1={52} y1={14} x2={60} y2={14} />
      <Comp x={67} y={14} letter="L" color={colors.inductor} />
      <Wire x1={75} y1={14} x2={82} y2={14} />
      <Dot x={82} y={14} />
      {/* Shunt C2 */}
      <Wire x1={82} y1={14} x2={82} y2={26} />
      <Comp x={82} y={33} letter="C" color={colors.capacitor} />
      <Gnd x={82} y={40} />
      {/* To output */}
      <Wire x1={82} y1={14} x2={98} y2={14} />
      <Gnd x={98} y={14} />
    </svg>
  );
}

const schematics = [SchematicRLC, SchematicTank, SchematicDouble, SchematicNotch, SchematicLadder];

/* ── Topology data ── */

const topologies = [
  {
    name: "RLC s\u00e9rie",
    desc: "R\u00e9sonance : |Z| minimal \u00e0 f\u2080",
    color: colors.cyan,
    path: "M 4,8 C 14,10 24,28 32,34 C 40,28 50,10 58,6",
  },
  {
    name: "Tank LC",
    desc: "Anti-r\u00e9sonance : |Z| maximal \u00e0 f\u2080",
    color: colors.blue,
    path: "M 4,32 C 14,30 24,14 32,5 C 40,14 50,30 58,33",
  },
  {
    name: "Double r\u00e9s.",
    desc: "2 dips s\u00e9par\u00e9s, 2+ d\u00e9cades",
    color: colors.purple,
    path: "M 4,7 C 10,12 14,24 19,30 C 23,24 27,10 32,7 C 37,12 42,24 47,30 C 51,24 55,10 58,6",
  },
  {
    name: "Notch",
    desc: "Rejet de bande : dip + pic",
    color: colors.orange,
    path: "M 4,20 C 12,18 20,28 26,34 C 30,26 34,10 40,5 C 48,14 54,22 58,24",
  },
  {
    name: "Ladder",
    desc: "Multi-\u00e9tages, forme complexe",
    color: colors.green,
    path: "M 4,8 C 9,12 13,22 17,28 C 20,22 24,12 28,8 C 32,14 36,24 40,28 C 44,22 50,10 58,6",
  },
];

/* ── Animated curve in comparison charts ── */

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

/* ── Slide ── */

export default function TopologiesSlide() {
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
          03 — G\u00e9n\u00e9rateur
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Choix des topologies
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-5"
        style={{ color: colors.grayLight }}
      >
        Pourquoi des templates plut\u00f4t que de l&apos;al\u00e9atoire pur ?
      </motion.p>

      {/* Comparison: Random vs Templates */}
      <div className="flex gap-5 w-full max-w-5xl">
        {/* LEFT: Random = bad */}
        <motion.div
          variants={fadeUp}
          className="flex-1 p-4 rounded-2xl border"
          style={{
            borderColor: `${colors.resistor}25`,
            background: `${colors.resistor}04`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: `${colors.resistor}20`, color: colors.resistor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              {"\u2717"}
            </motion.div>
            <span className="text-sm font-bold" style={{ color: colors.resistor }}>
              G\u00e9n\u00e9ration al\u00e9atoire
            </span>
          </div>

          <div className="rounded-xl p-2 mb-3" style={{ background: colors.bg }}>
            <svg viewBox="0 0 220 90" className="w-full">
              <line x1="25" y1="78" x2="210" y2="78" stroke={colors.grayDark} strokeWidth="0.5" />
              <line x1="25" y1="8" x2="25" y2="78" stroke={colors.grayDark} strokeWidth="0.5" />
              <text x="115" y="88" textAnchor="middle" fill={colors.gray} fontSize="7" fontFamily="monospace">log(f)</text>
              <text x="12" y="45" textAnchor="middle" fill={colors.gray} fontSize="7" fontFamily="monospace" transform="rotate(-90, 12, 45)">log|Z|</text>
              <MiniCurve path="M 30,18 C 60,22 120,45 155,55 C 180,62 195,68 205,70" color={`${colors.gray}90`} delay={0.6} />
              <MiniCurve path="M 30,23 C 60,27 120,48 155,58 C 180,64 195,70 205,73" color={`${colors.gray}70`} delay={0.75} />
              <MiniCurve path="M 30,15 C 60,19 120,42 155,52 C 180,59 195,65 205,67" color={`${colors.gray}80`} delay={0.9} />
              <MiniCurve path="M 30,28 C 60,31 120,47 155,54 C 180,58 195,62 205,64" color={`${colors.gray}60`} delay={1.05} />
              <motion.text x="120" y="22" textAnchor="middle" fill={colors.resistor} fontSize="9" fontFamily="monospace" fontWeight="bold"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                Toutes similaires !
              </motion.text>
            </svg>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]" style={{ color: colors.grayLight }}>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: colors.resistor }} />
              Majorit\u00e9 RC/RL, courbes monotones
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: colors.resistor }} />
              {"<"}15% de r\u00e9sonances par hasard
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: colors.resistor }} />
              Circuits d\u00e9g\u00e9n\u00e9r\u00e9s (composants isol\u00e9s)
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Templates = good */}
        <motion.div
          variants={fadeUp}
          className="flex-1 p-4 rounded-2xl border"
          style={{
            borderColor: `${colors.green}25`,
            background: `${colors.green}04`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: `${colors.green}20`, color: colors.green }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {"\u2713"}
            </motion.div>
            <span className="text-sm font-bold" style={{ color: colors.green }}>
              Topologies pr\u00e9d\u00e9finies
            </span>
          </div>

          <div className="rounded-xl p-2 mb-3" style={{ background: colors.bg }}>
            <svg viewBox="0 0 220 90" className="w-full">
              <line x1="25" y1="78" x2="210" y2="78" stroke={colors.grayDark} strokeWidth="0.5" />
              <line x1="25" y1="8" x2="25" y2="78" stroke={colors.grayDark} strokeWidth="0.5" />
              <text x="115" y="88" textAnchor="middle" fill={colors.gray} fontSize="7" fontFamily="monospace">log(f)</text>
              <text x="12" y="45" textAnchor="middle" fill={colors.gray} fontSize="7" fontFamily="monospace" transform="rotate(-90, 12, 45)">log|Z|</text>
              <MiniCurve path="M 30,16 C 55,22 80,50 110,65 C 140,50 170,22 205,13" color={colors.cyan} delay={0.6} />
              <MiniCurve path="M 30,62 C 55,58 85,32 110,13 C 135,32 170,58 205,64" color={colors.blue} delay={0.8} />
              <MiniCurve path="M 30,18 C 40,26 50,46 65,56 C 75,46 82,26 95,18 C 108,26 125,46 140,56 C 155,44 175,20 205,14" color={colors.purple} delay={1.0} />
              <MiniCurve path="M 30,38 C 48,34 62,50 78,64 C 88,48 98,22 115,13 C 140,26 175,38 205,42" color={colors.orange} delay={1.2} />
              {[
                { y: 13, label: "RLC", color: colors.cyan },
                { y: 22, label: "Tank", color: colors.blue },
                { y: 31, label: "Double", color: colors.purple },
                { y: 40, label: "Notch", color: colors.orange },
              ].map((l) => (
                <motion.g key={l.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  <line x1="160" y1={l.y} x2="172" y2={l.y} stroke={l.color} strokeWidth="1.5" />
                  <text x="175" y={l.y + 3} fill={l.color} fontSize="7" fontFamily="monospace">{l.label}</text>
                </motion.g>
              ))}
            </svg>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]" style={{ color: colors.grayLight }}>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: colors.green }} />
              Chaque template {"→"} forme Z(f) <span style={{ color: colors.green }}>unique</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: colors.green }} />
              Distribution contr\u00f4l\u00e9e (20/55/25%)
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: colors.green }} />
              Valeurs al\u00e9atoires dans chaque template
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom: 5 topology cards with schematic + curve */}
      <motion.div variants={fadeUp} className="flex gap-3 mt-4 w-full max-w-5xl">
        {topologies.map((topo, i) => {
          const Schematic = schematics[i];
          return (
            <motion.div
              key={topo.name}
              className="flex-1 p-2.5 rounded-xl border"
              style={{
                borderColor: `${topo.color}20`,
                background: `${topo.color}06`,
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.12, type: "spring" }}
            >
              {/* Circuit schematic */}
              <div className="rounded-lg p-1 mb-1.5" style={{ background: `${colors.bg}90` }}>
                <Schematic />
              </div>

              {/* Impedance curve */}
              <div className="rounded-lg p-1 mb-1.5" style={{ background: `${colors.bg}60` }}>
                <svg viewBox="0 0 62 32" className="w-full h-7">
                  <line x1="2" y1="29" x2="60" y2="29" stroke={colors.grayDark} strokeWidth="0.3" />
                  <line x1="2" y1="2" x2="2" y2="29" stroke={colors.grayDark} strokeWidth="0.3" />
                  <text x="31" y="31.5" textAnchor="middle" fill={colors.gray} fontSize="3.5" fontFamily="monospace">|Z|(f)</text>
                  <motion.path
                    d={topo.path}
                    fill="none"
                    stroke={topo.color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.8 + i * 0.12, duration: 0.6, ease: "easeInOut" }}
                  />
                </svg>
              </div>

              {/* Label */}
              <div className="text-center">
                <div className="text-[10px] font-bold font-mono" style={{ color: topo.color }}>
                  {topo.name}
                </div>
                <div className="text-[7px] mt-0.5 leading-tight" style={{ color: colors.gray }}>
                  {topo.desc}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
