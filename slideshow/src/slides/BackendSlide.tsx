"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, slideRight, slideLeft, staggerContainer, staggerFast, glow } from "@/lib/animations";
import { colors } from "@/lib/theme";

const endpoints = [
  { method: "POST", path: "/api/predict", desc: "Pr\u00E9diction circuit", color: colors.green },
  { method: "POST", path: "/api/impedance", desc: "Calcul Z(f)", color: colors.cyan },
  { method: "GET", path: "/api/health", desc: "Status serveur", color: colors.yellow },
  { method: "POST", path: "/api/candidates", desc: "Top-K candidats", color: colors.purple },
];

export default function BackendSlide() {
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
        Backend API
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-lg mb-12"
        style={{ color: colors.grayLight }}
      >
        Serveur FastAPI pour l&apos;inf&eacute;rence en production
      </motion.p>

      <div className="flex items-stretch gap-10">
        {/* Model card */}
        <motion.div
          variants={slideRight}
          className="flex flex-col items-center p-6 rounded-2xl border"
          style={{
            borderColor: `${colors.blue}40`,
            background: `${colors.blue}08`,
            width: 200,
          }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl"
            style={{ background: `${colors.blue}20`, color: colors.blue }}
            animate={{ boxShadow: [`0 0 0px ${colors.blue}00`, `0 0 20px ${colors.blue}40`, `0 0 0px ${colors.blue}00`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            &#x1F9E0;
          </motion.div>
          <div className="font-bold text-lg" style={{ color: colors.blue }}>
            Model
          </div>
          <div className="text-xs font-mono mt-2 text-center" style={{ color: colors.grayLight }}>
            model_v5.pt
          </div>
          <div className="text-xs mt-1" style={{ color: colors.gray }}>
            PyTorch &bull; GPU
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <svg width="40" height="20">
            <motion.line x1="0" y1="10" x2="30" y2="10" stroke={colors.grayDark} strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.4 }} />
            <motion.polygon points="28,5 38,10 28,15" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
          </svg>
        </motion.div>

        {/* FastAPI Server */}
        <motion.div
          variants={scaleIn}
          className="relative flex flex-col p-6 rounded-2xl border"
          style={{
            borderColor: `${colors.green}40`,
            background: `linear-gradient(135deg, ${colors.green}08, ${colors.cyan}05)`,
            minWidth: 340,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ background: colors.green }}
              animate={glow}
            />
            <span className="font-bold text-lg" style={{ color: colors.green }}>
              FastAPI Server
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${colors.green}20`, color: colors.green }}>
              :8000
            </span>
          </div>

          {/* Endpoints */}
          <motion.div className="flex flex-col gap-2" variants={staggerFast}>
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                variants={scaleIn}
                className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{ background: `${ep.color}20`, color: ep.color, minWidth: 40, textAlign: "center" }}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-sm" style={{ color: colors.white }}>
                  {ep.path}
                </span>
                <span className="text-xs ml-auto" style={{ color: colors.gray }}>
                  {ep.desc}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Glow border */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: `1px solid ${colors.green}` }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <svg width="40" height="20">
            <motion.line x1="0" y1="10" x2="30" y2="10" stroke={colors.grayDark} strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: 0.4 }} />
            <motion.polygon points="28,5 38,10 28,15" fill={colors.grayDark}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} />
          </svg>
        </motion.div>

        {/* Response card */}
        <motion.div
          variants={slideLeft}
          className="flex flex-col p-5 rounded-2xl border font-mono text-sm"
          style={{
            borderColor: colors.border,
            background: `${colors.bgCard}cc`,
            minWidth: 220,
          }}
        >
          <div className="text-xs mb-3" style={{ color: colors.gray }}>
            Response JSON
          </div>
          <motion.pre
            className="text-xs leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <span style={{ color: colors.gray }}>{"{"}</span>{"\n"}
            <span style={{ color: colors.purple }}>&nbsp;&nbsp;&quot;circuit&quot;</span>: [
            <span style={{ color: colors.resistor }}>R</span>,{" "}
            <span style={{ color: colors.inductor }}>L</span>,{" "}
            <span style={{ color: colors.capacitor }}>C</span>],{"\n"}
            <span style={{ color: colors.purple }}>&nbsp;&nbsp;&quot;error&quot;</span>:{" "}
            <span style={{ color: colors.green }}>0.023</span>,{"\n"}
            <span style={{ color: colors.purple }}>&nbsp;&nbsp;&quot;valid&quot;</span>:{" "}
            <span style={{ color: colors.green }}>true</span>{"\n"}
            <span style={{ color: colors.gray }}>{"}"}</span>
          </motion.pre>
        </motion.div>
      </div>
    </motion.div>
  );
}
