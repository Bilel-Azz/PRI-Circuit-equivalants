"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { colors } from "@/lib/theme";

// Class box component
function ClassBox({
  x, y, w, h, name, attrs, methods, color, delay,
}: {
  x: number; y: number; w: number; h: number;
  name: string; attrs: string[]; methods: string[];
  color: string; delay: number;
}) {
  const headerH = 24;
  const lineH = 14;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", damping: 20, stiffness: 150 }}
    >
      <rect x={x} y={y} width={w} height={h} rx="6"
        fill={`${color}08`} stroke={color} strokeWidth="1.2" />
      <rect x={x} y={y} width={w} height={headerH} rx="6"
        fill={`${color}18`} />
      <rect x={x} y={y + headerH - 4} width={w} height="4"
        fill={`${color}18`} />
      <text x={x + w / 2} y={y + 16} textAnchor="middle"
        fill={color} fontSize="10" fontWeight="bold" fontFamily="monospace">
        {name}
      </text>
      <line x1={x} y1={y + headerH} x2={x + w} y2={y + headerH}
        stroke={`${color}40`} strokeWidth="0.5" />
      {attrs.map((attr, i) => (
        <text key={`a${i}`} x={x + 8} y={y + headerH + 13 + i * lineH}
          fill={colors.white} fontSize="8" fontFamily="monospace" opacity={0.85}>
          {attr}
        </text>
      ))}
      {methods.length > 0 && (
        <line x1={x} y1={y + headerH + attrs.length * lineH + 4}
          x2={x + w} y2={y + headerH + attrs.length * lineH + 4}
          stroke={`${color}40`} strokeWidth="0.5" />
      )}
      {methods.map((method, i) => (
        <text key={`m${i}`} x={x + 8}
          y={y + headerH + attrs.length * lineH + 17 + i * lineH}
          fill={colors.cyan} fontSize="8" fontFamily="monospace">
          {method}
        </text>
      ))}
    </motion.g>
  );
}

// Arrow component - white, with optional path to avoid blocks
function Arrow({
  points, label, dashed, delay,
}: {
  points: [number, number][]; label?: string; dashed?: boolean; delay: number;
}) {
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  // Label position at midpoint
  const mid = Math.floor(points.length / 2);
  const mx = (points[mid - 1][0] + points[mid][0]) / 2;
  const my = (points[mid - 1][1] + points[mid][1]) / 2;

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.4 }}>
      <path d={pathD} fill="none" stroke={colors.white} strokeWidth="1" opacity={0.6}
        strokeDasharray={dashed ? "4 3" : "none"} markerEnd="url(#arrowW)" />
      {label && (
        <text x={mx} y={my - 5} textAnchor="middle"
          fill={colors.white} fontSize="7" fontFamily="monospace" opacity={0.7}>
          {label}
        </text>
      )}
    </motion.g>
  );
}

export default function DiagrammeClasseSlide() {
  return (
    <motion.div
      className="slide"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="absolute top-8 left-10">
        <span className="text-xs font-mono px-3 py-1 rounded-full"
          style={{ background: `${colors.green}15`, color: colors.green }}>
          03 — Architecture
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}>
        Diagramme de classes
      </motion.h2>
      <motion.p variants={fadeUp} className="text-sm mb-4"
        style={{ color: colors.grayLight }}>
        Structure objet du système
      </motion.p>

      <motion.div variants={fadeUp}>
        <svg width="920" height="340" viewBox="0 0 920 340">
          <defs>
            <marker id="arrowW" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill={colors.white} opacity={0.6} />
            </marker>
          </defs>

          {/* ===== ROW 1: Circuit, CircuitTransformerV2, CircuitModel ===== */}

          {/* Circuit (top-left) */}
          <ClassBox x={20} y={20} w={170} h={85}
            name="Circuit"
            attrs={["components: Component[]", "num_nodes: int"]}
            methods={["validate() → bool"]}
            color={colors.blue} delay={0.3} />

          {/* CircuitTransformerV2 (top-center) */}
          <ClassBox x={340} y={20} w={200} h={85}
            name="CircuitTransformerV2"
            attrs={["encoder: EncoderCNN", "decoder: TransformerDecoder", "latent_dim: 256"]}
            methods={["forward(z) → seq"]}
            color={colors.green} delay={0.4} />

          {/* nn.Module badge */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <rect x={395} y={2} width={90} height={16} rx="4"
              fill={`${colors.purple}15`} stroke={colors.purple} strokeWidth="0.8" />
            <text x={440} y={13} textAnchor="middle"
              fill={colors.purple} fontSize="8" fontFamily="monospace">
              nn.Module
            </text>
          </motion.g>

          {/* CircuitModel (top-right) */}
          <ClassBox x={700} y={20} w={190} h={85}
            name="CircuitModel"
            attrs={["model: TransformerV2", "device: mps | cuda"]}
            methods={["generate(Z, tau, N) → best"]}
            color={colors.orange} delay={0.5} />

          {/* ===== ROW 2: Component, EncoderCNN, TransformerDecoder, MNASolver ===== */}

          {/* Component (bottom-left) */}
          <ClassBox x={20} y={160} w={170} h={90}
            name="Component"
            attrs={["comp_type: int (R/L/C)", "node_a: int", "node_b: int", "value: float"]}
            methods={[]}
            color={colors.cyan} delay={0.5} />

          {/* EncoderCNN (bottom-center-left) */}
          <ClassBox x={260} y={160} w={170} h={90}
            name="EncoderCNN"
            attrs={["conv: Conv1d ×3", "mlp: Linear(3072→256)"]}
            methods={["forward(x) → latent(256)"]}
            color={colors.blue} delay={0.6} />

          {/* TransformerDecoder (bottom-center-right) */}
          <ClassBox x={470} y={160} w={170} h={90}
            name="TransformerDecoder"
            attrs={["layers: 6 × Block", "d_model=512, nhead=8"]}
            methods={["decode(latent, seq) → logits"]}
            color={colors.green} delay={0.7} />

          {/* MNASolver (bottom-right) */}
          <ClassBox x={710} y={160} w={170} h={80}
            name="MNASolver"
            attrs={["frequencies: ndarray (100,)"]}
            methods={["compute_impedance(c) → (2,100)"]}
            color={colors.yellow} delay={0.6} />

          {/* FastAPI Backend (far right, row 2) */}
          <ClassBox x={710} y={270} w={170} h={60}
            name="FastAPI Backend"
            attrs={["port: 8000"]}
            methods={["POST /generate"]}
            color={colors.purple} delay={0.8} />

          {/* ===== ARROWS (all white, routed to avoid crossing blocks) ===== */}

          {/* Circuit → Component (down) */}
          <Arrow points={[[105, 105], [105, 160]]} label="contient 1..6" delay={0.8} />

          {/* CircuitTransformerV2 → EncoderCNN (down-left) */}
          <Arrow points={[[390, 105], [345, 160]]} label="encoder" delay={0.9} />

          {/* CircuitTransformerV2 → TransformerDecoder (down-right) */}
          <Arrow points={[[490, 105], [555, 160]]} label="decoder" delay={1.0} />

          {/* CircuitModel → CircuitTransformerV2 (left) */}
          <Arrow points={[[700, 62], [540, 62]]} label="utilise" dashed delay={1.1} />

          {/* CircuitModel → MNASolver (down) */}
          <Arrow points={[[795, 105], [795, 160]]} label="compute Z(f)" dashed delay={1.2} />

          {/* Backend → CircuitModel (up) */}
          <Arrow points={[[795, 270], [795, 105]]} label="" delay={1.3} />

          {/* ===== LEGEND (below, clear of all blocks) ===== */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            {/* Solid arrow = composition */}
            <line x1={30} y1={320} x2={70} y2={320} stroke={colors.white} strokeWidth="1" opacity={0.6} markerEnd="url(#arrowW)" />
            <text x={78} y={323} fill={colors.white} fontSize="8" fontFamily="monospace" opacity={0.8}>
              composition (contient)
            </text>

            {/* Dashed arrow = utilisation */}
            <line x1={280} y1={320} x2={320} y2={320} stroke={colors.white} strokeWidth="1" opacity={0.6} strokeDasharray="4 3" markerEnd="url(#arrowW)" />
            <text x={328} y={323} fill={colors.white} fontSize="8" fontFamily="monospace" opacity={0.8}>
              utilisation (dépend de)
            </text>

            {/* Badge = héritage */}
            <rect x={530} y={313} width={55} height={14} rx="3" fill={`${colors.purple}15`} stroke={colors.purple} strokeWidth="0.6" />
            <text x={557} y={323} textAnchor="middle" fill={colors.purple} fontSize="7" fontFamily="monospace">nn.Module</text>
            <text x={593} y={323} fill={colors.white} fontSize="8" fontFamily="monospace" opacity={0.8}>
              héritage (classe parente)
            </text>
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
