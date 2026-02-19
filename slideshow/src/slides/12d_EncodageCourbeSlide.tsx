"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

function impedanceMagnitude(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = 10 + t * 180;
    const y = 55 - 35 * Math.exp(-((t - 0.4) ** 2) / 0.01) + 4 * Math.sin(t * 16);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function phaseCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = 10 + t * 180;
    const y = 15 + 40 / (1 + Math.exp(-25 * (t - 0.4)));
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function EncodageCourbeSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Encodage courbe
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-3" style={{ color: colors.white }}>
        Comment la courbe entre dans le CNN
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-8" style={{ color: colors.grayLight }}>
        {"Transformer Z(f) en entr\u00e9e num\u00e9rique exploitable par le mod\u00e8le"}
      </motion.p>

      {/* 3 steps pipeline */}
      <div className="flex items-start gap-4">
        {/* Step 1: Raw data */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-4 rounded-2xl border"
          style={{ borderColor: `${colors.cyan}30`, background: `${colors.cyan}05`, width: 220 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${colors.cyan}20`, color: colors.cyan }}>1</div>
            <span className="text-xs font-mono font-bold" style={{ color: colors.cyan }}>DONN{"\u00c9"}ES BRUTES</span>
          </div>
          <div className="text-[11px] mb-3" style={{ color: colors.grayLight }}>
            Z(f) = 100 points de mesure
          </div>
          <div className="text-[10px] mb-1" style={{ color: colors.grayLight }}>
            Chacun avec :
          </div>
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex items-center gap-2 text-[10px] px-2 py-1 rounded" style={{ background: `${colors.cyan}10` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: colors.cyan }} />
              <span style={{ color: colors.cyan }}>Magnitude ({"\u03A9"})</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] px-2 py-1 rounded" style={{ background: `${colors.orange}10` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: colors.orange }} />
              <span style={{ color: colors.orange }}>Phase (degr{"\u00e9"}s)</span>
            </div>
          </div>
          <div className="text-[9px] font-mono p-2 rounded" style={{ background: "rgba(0,0,0,0.3)", color: colors.gray }}>
            Ex: f=1kHz {"\u2192"} |Z|=470{"\u03A9"}, {"\u03C6"}=45{"\u00b0"}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div className="flex items-center mt-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.blue} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
          </svg>
        </motion.div>

        {/* Step 2: Normalization */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-4 rounded-2xl border"
          style={{ borderColor: `${colors.blue}30`, background: `${colors.blue}05`, width: 260 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${colors.blue}20`, color: colors.blue }}>2</div>
            <span className="text-xs font-mono font-bold" style={{ color: colors.blue }}>NORMALISATION</span>
          </div>

          <div className="flex gap-3 mb-3">
            {/* Magnitude normalization */}
            <div className="flex-1 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
              <div className="text-[10px] font-mono font-bold mb-1" style={{ color: colors.cyan }}>Magnitude</div>
              <div className="text-xs font-mono" style={{ color: colors.white }}>log10(|Z|)</div>
              <div className="text-[9px] mt-1" style={{ color: colors.gray }}>
                Car 0.1{"\u03A9"} {"\u00e0"} 10M{"\u03A9"}
              </div>
              <div className="text-[9px]" style={{ color: colors.gray }}>
                = 8 ordres de grandeur
              </div>
            </div>
            {/* Phase normalization */}
            <div className="flex-1 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
              <div className="text-[10px] font-mono font-bold mb-1" style={{ color: colors.orange }}>Phase</div>
              <div className="text-xs font-mono" style={{ color: colors.white }}>{"\u03C6"} / {"\u03C0"}</div>
              <div className="text-[9px] mt-1" style={{ color: colors.gray }}>
                Ram{"\u00e8"}ne -90{"\u00b0"} {"\u00e0"} +90{"\u00b0"}
              </div>
              <div className="text-[9px]" style={{ color: colors.gray }}>
                dans [-0.5, 0.5]
              </div>
            </div>
          </div>

          {/* Why */}
          <div className="text-[9px] px-2 py-1.5 rounded" style={{ background: `${colors.blue}10`, color: colors.blue }}>
            Normaliser = m{"\u00eames"} {"\u00e9"}chelles {"\u2192"} CNN converge mieux
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div className="flex items-center mt-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <svg width="30" height="20">
            <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.blue} strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6 }} />
            <motion.polygon points="20,5 30,10 20,15" fill={colors.blue}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} />
          </svg>
        </motion.div>

        {/* Step 3: Tensor format */}
        <motion.div variants={scaleIn}
          className="flex flex-col p-4 rounded-2xl border"
          style={{ borderColor: `${colors.purple}30`, background: `${colors.purple}05`, width: 280 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${colors.purple}20`, color: colors.purple }}>3</div>
            <span className="text-xs font-mono font-bold" style={{ color: colors.purple }}>FORMAT TENSEUR</span>
          </div>

          <div className="text-sm font-mono font-bold mb-3" style={{ color: colors.white }}>
            Forme : (2, 100)
          </div>
          <div className="text-[10px] mb-3" style={{ color: colors.grayLight }}>
            {"2 canaux \u00d7 100 fr\u00e9quences \u2014 comme une \"image 1D \u00e0 2 couleurs\""}
          </div>

          {/* Visual: two channels */}
          <div className="flex flex-col gap-2">
            <motion.div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 }}>
              <div className="text-[9px] font-mono w-20" style={{ color: colors.cyan }}>Canal 1: |Z|</div>
              <div className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: `${colors.cyan}15`, color: colors.cyan }}>
                [2.67, 2.71, ..., 3.12]
              </div>
            </motion.div>
            <motion.div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.15 }}>
              <div className="text-[9px] font-mono w-20" style={{ color: colors.orange }}>Canal 2: {"\u03C6"}</div>
              <div className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: `${colors.orange}15`, color: colors.orange }}>
                [0.25, 0.24, ..., -0.1]
              </div>
            </motion.div>
          </div>

          {/* Result badge */}
          <motion.div className="mt-3 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.4, type: "spring" }}>
            <svg width="30" height="20">
              <motion.line x1="0" y1="10" x2="22" y2="10" stroke={colors.grayDark} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.5 }} />
              <motion.polygon points="20,5 30,10 20,15" fill={colors.grayDark}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} />
            </svg>
            <div className="font-mono text-sm font-bold px-3 py-1 rounded-lg" style={{ background: `${colors.purple}20`, color: colors.purple }}>
              (2, 100)
            </div>
            <div className="text-[10px]" style={{ color: colors.gray }}>entr{"\u00e9"}e CNN</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom: curve visualization showing both channels */}
      <motion.div className="mt-6 px-5 py-3 rounded-xl border flex items-center gap-6"
        style={{ borderColor: colors.border, background: `${colors.bgCard}cc` }}
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }}>
        <svg width="200" height="70" viewBox="0 0 200 70">
          <line x1="10" y1="60" x2="190" y2="60" stroke={colors.grayDark} strokeWidth="0.5" />
          <line x1="10" y1="5" x2="10" y2="60" stroke={colors.grayDark} strokeWidth="0.5" />
          <motion.path d={impedanceMagnitude()} fill="none" stroke={colors.cyan} strokeWidth="2" strokeLinecap="round"
            variants={drawPath} />
          <motion.path d={phaseCurve()} fill="none" stroke={colors.orange} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4"
            variants={drawPath} />
          <text x="100" y="68" textAnchor="middle" fill={colors.gray} fontSize="7" fontFamily="monospace">100 fr{"\u00e9"}quences log-spaced (10Hz {"\u2192"} 10MHz)</text>
        </svg>
        <div className="flex flex-col gap-1 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 rounded" style={{ background: colors.cyan }} />
            <span style={{ color: colors.cyan }}>log10(|Z|) {"\u2014"} magnitude</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 rounded" style={{ background: colors.orange, borderStyle: "dashed" }} />
            <span style={{ color: colors.orange }}>{"\u03C6"}/{"\u03C0"} {"\u2014"} phase normalis{"\u00e9"}e</span>
          </div>
        </div>
        <div className="ml-auto text-xs font-mono" style={{ color: colors.grayLight }}>
          {"\u2248"} scanner une image 1D
        </div>
      </motion.div>
    </motion.div>
  );
}
