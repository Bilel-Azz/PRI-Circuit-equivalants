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
  return (
    <svg viewBox="0 0 110 45" className="w-full h-12">
      <InLabel x={5} y={22} />
      <Wire x1={7} y1={22} x2={17} y2={22} />
      <Comp x={25} y={22} letter="R" color={colors.resistor} />
      <Wire x1={33} y1={22} x2={42} y2={22} />
      <Comp x={50} y={22} letter="L" color={colors.inductor} />
      <Wire x1={58} y1={22} x2={67} y2={22} />
      <Comp x={75} y={22} letter="C" color={colors.capacitor} />
      <Wire x1={83} y1={22} x2={95} y2={22} />
      <Gnd x={95} y={22} />
    </svg>
  );
}

function SchematicTank() {
  return (
    <svg viewBox="0 0 110 55" className="w-full h-14">
      <InLabel x={5} y={27} />
      <Wire x1={7} y1={27} x2={15} y2={27} />
      <Comp x={23} y={27} letter="R" color={colors.resistor} />
      <Wire x1={31} y1={27} x2={38} y2={27} />
      <Dot x={38} y={27} />
      <Wire x1={38} y1={27} x2={38} y2={14} />
      <Wire x1={38} y1={14} x2={47} y2={14} />
      <Comp x={55} y={14} letter="L" color={colors.inductor} />
      <Wire x1={63} y1={14} x2={75} y2={14} />
      <Wire x1={75} y1={14} x2={75} y2={27} />
      <Wire x1={38} y1={27} x2={38} y2={40} />
      <Wire x1={38} y1={40} x2={47} y2={40} />
      <Comp x={55} y={40} letter="C" color={colors.capacitor} />
      <Wire x1={63} y1={40} x2={75} y2={40} />
      <Wire x1={75} y1={40} x2={75} y2={27} />
      <Dot x={75} y={27} />
      <Wire x1={75} y1={27} x2={90} y2={27} />
      <Gnd x={90} y={27} />
    </svg>
  );
}

function SchematicDouble() {
  return (
    <svg viewBox="0 0 110 55" className="w-full h-14">
      <InLabel x={4} y={27} />
      <Wire x1={6} y1={27} x2={10} y2={27} />
      <Comp x={17} y={27} letter="R" color={colors.resistor} />
      <Wire x1={25} y1={27} x2={30} y2={27} />
      <Dot x={30} y={27} />
      <Wire x1={30} y1={27} x2={30} y2={12} />
      <Wire x1={30} y1={12} x2={35} y2={12} />
      <Comp x={43} y={12} letter="L" color={colors.inductor} />
      <Wire x1={51} y1={12} x2={56} y2={12} />
      <Comp x={64} y={12} letter="C" color={colors.capacitor} />
      <Wire x1={72} y1={12} x2={80} y2={12} />
      <Wire x1={80} y1={12} x2={80} y2={27} />
      <Wire x1={30} y1={27} x2={30} y2={42} />
      <Wire x1={30} y1={42} x2={35} y2={42} />
      <Comp x={43} y={42} letter="L" color={colors.inductor} />
      <Wire x1={51} y1={42} x2={56} y2={42} />
      <Comp x={64} y={42} letter="C" color={colors.capacitor} />
      <Wire x1={72} y1={42} x2={80} y2={42} />
      <Wire x1={80} y1={42} x2={80} y2={27} />
      <Dot x={80} y={27} />
      <Wire x1={80} y1={27} x2={95} y2={27} />
      <Gnd x={95} y={27} />
    </svg>
  );
}

function SchematicNotch() {
  return (
    <svg viewBox="0 0 110 55" className="w-full h-14">
      <InLabel x={4} y={27} />
      <Wire x1={6} y1={27} x2={10} y2={27} />
      <Comp x={17} y={27} letter="R" color={colors.resistor} />
      <Wire x1={25} y1={27} x2={32} y2={27} />
      <Dot x={32} y={27} />
      <Wire x1={32} y1={27} x2={32} y2={14} />
      <Wire x1={32} y1={14} x2={40} y2={14} />
      <Comp x={48} y={14} letter="L" color={colors.inductor} />
      <Wire x1={56} y1={14} x2={65} y2={14} />
      <Wire x1={65} y1={14} x2={65} y2={27} />
      <Wire x1={32} y1={27} x2={32} y2={40} />
      <Wire x1={32} y1={40} x2={40} y2={40} />
      <Comp x={48} y={40} letter="C" color={colors.capacitor} />
      <Wire x1={56} y1={40} x2={65} y2={40} />
      <Wire x1={65} y1={40} x2={65} y2={27} />
      <Dot x={65} y={27} />
      <Wire x1={65} y1={27} x2={72} y2={27} />
      <Comp x={80} y={27} letter="R" color={colors.resistor} />
      <Wire x1={88} y1={27} x2={98} y2={27} />
      <Gnd x={98} y={27} />
    </svg>
  );
}

function SchematicLadder() {
  return (
    <svg viewBox="0 0 110 55" className="w-full h-14">
      <InLabel x={4} y={16} />
      <Wire x1={6} y1={16} x2={10} y2={16} />
      <Comp x={17} y={16} letter="R" color={colors.resistor} />
      <Wire x1={25} y1={16} x2={30} y2={16} />
      <Comp x={37} y={16} letter="L" color={colors.inductor} />
      <Wire x1={45} y1={16} x2={52} y2={16} />
      <Dot x={52} y={16} />
      <Wire x1={52} y1={16} x2={52} y2={28} />
      <Comp x={52} y={35} letter="C" color={colors.capacitor} />
      <Gnd x={52} y={42} />
      <Wire x1={52} y1={16} x2={60} y2={16} />
      <Comp x={67} y={16} letter="L" color={colors.inductor} />
      <Wire x1={75} y1={16} x2={82} y2={16} />
      <Dot x={82} y={16} />
      <Wire x1={82} y1={16} x2={82} y2={28} />
      <Comp x={82} y={35} letter="C" color={colors.capacitor} />
      <Gnd x={82} y={42} />
      <Wire x1={82} y1={16} x2={98} y2={16} />
      <Gnd x={98} y={16} />
    </svg>
  );
}

const schematics = [SchematicRLC, SchematicTank, SchematicDouble, SchematicNotch, SchematicLadder];

/* ── Topology data ── */

const topologies = [
  {
    name: "RLC série",
    desc: "Résonance : |Z| minimal à f₀",
    pct: "20%",
    color: colors.cyan,
    path: "M 4,8 C 14,10 24,28 32,34 C 40,28 50,10 58,6",
  },
  {
    name: "Tank LC",
    desc: "Anti-résonance : |Z| maximal à f₀",
    pct: "25%",
    color: colors.blue,
    path: "M 4,32 C 14,30 24,14 32,5 C 40,14 50,30 58,33",
  },
  {
    name: "Double rés.",
    desc: "2 dips séparés, 2+ décades",
    pct: "25%",
    color: colors.purple,
    path: "M 4,7 C 10,12 14,24 19,30 C 23,24 27,10 32,7 C 37,12 42,24 47,30 C 51,24 55,10 58,6",
  },
  {
    name: "Notch",
    desc: "Rejet de bande : dip + pic",
    pct: "15%",
    color: colors.orange,
    path: "M 4,20 C 12,18 20,28 26,34 C 30,26 34,10 40,5 C 48,14 54,22 58,24",
  },
  {
    name: "Ladder",
    desc: "Multi-étages, forme complexe",
    pct: "15%",
    color: colors.green,
    path: "M 4,8 C 9,12 13,22 17,28 C 20,22 24,12 28,8 C 32,14 36,24 40,28 C 44,22 50,10 58,6",
  },
];

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
          03 — Générateur
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Les 5 topologies
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-sm mb-8"
        style={{ color: colors.grayLight }}
      >
        5 familles de circuits couvrant toutes les formes d&apos;impédance
      </motion.p>

      {/* 5 topology cards — bigger now with more space */}
      <motion.div variants={fadeUp} className="flex gap-4 w-full max-w-5xl mb-6">
        {topologies.map((topo, i) => {
          const Schematic = schematics[i];
          return (
            <motion.div
              key={topo.name}
              className="flex-1 p-3 rounded-xl border"
              style={{
                borderColor: `${topo.color}20`,
                background: `${topo.color}06`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.12, type: "spring" }}
            >
              {/* Percentage badge */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] font-mono font-bold" style={{ color: topo.color }}>
                  {topo.name}
                </div>
                <div
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: `${topo.color}15`, color: topo.color }}
                >
                  {topo.pct}
                </div>
              </div>

              {/* Circuit schematic */}
              <div className="rounded-lg p-1.5 mb-2" style={{ background: `${colors.bg}90` }}>
                <Schematic />
              </div>

              {/* Impedance curve */}
              <div className="rounded-lg p-1.5 mb-2" style={{ background: `${colors.bg}60` }}>
                <svg viewBox="0 0 62 36" className="w-full h-9">
                  <line x1="2" y1="32" x2="60" y2="32" stroke={colors.grayDark} strokeWidth="0.3" />
                  <line x1="2" y1="2" x2="2" y2="32" stroke={colors.grayDark} strokeWidth="0.3" />
                  <text x="31" y="35.5" textAnchor="middle" fill={colors.gray} fontSize="3.5" fontFamily="monospace">|Z|(f)</text>
                  <motion.path
                    d={topo.path}
                    fill="none"
                    stroke={topo.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8 + i * 0.12, duration: 0.6, ease: "easeInOut" }}
                  />
                </svg>
              </div>

              {/* Description */}
              <div className="text-[8px] leading-tight text-center" style={{ color: colors.gray }}>
                {topo.desc}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Distribution bar */}
      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="text-[10px] font-mono mb-2" style={{ color: colors.gray }}>
          Distribution du dataset (150k circuits)
        </div>
        <div className="flex h-5 rounded-full overflow-hidden">
          {topologies.map((topo) => (
            <div
              key={topo.name}
              className="flex items-center justify-center text-[8px] font-mono font-bold"
              style={{
                width: topo.pct,
                background: `${topo.color}30`,
                color: topo.color,
              }}
            >
              {topo.pct}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
