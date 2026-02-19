"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, drawPath } from "@/lib/animations";
import { colors } from "@/lib/theme";

// Class box component
function ClassBox({
  x,
  y,
  w,
  h,
  name,
  attrs,
  methods,
  color,
  delay,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  attrs: string[];
  methods: string[];
  color: string;
  delay: number;
}) {
  const headerH = 24;
  const lineH = 14;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", damping: 20, stiffness: 150 }}
    >
      {/* Box outline */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="6"
        fill={`${color}08`}
        stroke={color}
        strokeWidth="1.2"
      />

      {/* Header */}
      <rect
        x={x}
        y={y}
        width={w}
        height={headerH}
        rx="6"
        fill={`${color}18`}
      />
      <rect
        x={x}
        y={y + headerH - 4}
        width={w}
        height="4"
        fill={`${color}18`}
      />
      <text
        x={x + w / 2}
        y={y + 16}
        textAnchor="middle"
        fill={color}
        fontSize="10"
        fontWeight="bold"
        fontFamily="monospace"
      >
        {name}
      </text>

      {/* Separator */}
      <line
        x1={x}
        y1={y + headerH}
        x2={x + w}
        y2={y + headerH}
        stroke={`${color}40`}
        strokeWidth="0.5"
      />

      {/* Attributes */}
      {attrs.map((attr, i) => (
        <text
          key={`a${i}`}
          x={x + 8}
          y={y + headerH + 13 + i * lineH}
          fill={colors.grayLight}
          fontSize="8"
          fontFamily="monospace"
        >
          {attr}
        </text>
      ))}

      {/* Separator 2 */}
      {methods.length > 0 && (
        <line
          x1={x}
          y1={y + headerH + attrs.length * lineH + 4}
          x2={x + w}
          y2={y + headerH + attrs.length * lineH + 4}
          stroke={`${color}40`}
          strokeWidth="0.5"
        />
      )}

      {/* Methods */}
      {methods.map((method, i) => (
        <text
          key={`m${i}`}
          x={x + 8}
          y={y + headerH + attrs.length * lineH + 17 + i * lineH}
          fill={colors.cyan}
          fontSize="8"
          fontFamily="monospace"
        >
          {method}
        </text>
      ))}
    </motion.g>
  );
}

// Arrow component
function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
  dashed,
  delay,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  dashed?: boolean;
  delay: number;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colors.grayDark}
        strokeWidth="1"
        strokeDasharray={dashed ? "4 3" : "none"}
        markerEnd="url(#arrowHead)"
      />
      {label && (
        <text
          x={mx}
          y={my - 5}
          textAnchor="middle"
          fill={colors.gray}
          fontSize="7"
          fontFamily="monospace"
        >
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
        <span
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{ background: `${colors.green}15`, color: colors.green }}
        >
          03 — Architecture
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-4xl font-bold mb-2"
        style={{ color: colors.white }}
      >
        Diagramme de classes
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="text-sm mb-6"
        style={{ color: colors.grayLight }}
      >
        Structure objet du système de synthèse de circuits
      </motion.p>

      <motion.div variants={fadeUp}>
        <svg width="920" height="380" viewBox="0 0 920 380">
          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowHead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill={colors.grayDark} />
            </marker>
            <marker
              id="diamond"
              markerWidth="10"
              markerHeight="8"
              refX="5"
              refY="4"
              orient="auto"
            >
              <path
                d="M0,4 L5,0 L10,4 L5,8 Z"
                fill={colors.blue}
                stroke={colors.blue}
                strokeWidth="0.5"
              />
            </marker>
          </defs>

          {/* ===== DATA LAYER (left) ===== */}

          {/* Circuit class */}
          <ClassBox
            x={20}
            y={30}
            w={180}
            h={90}
            name="Circuit"
            attrs={["components: Component[]", "num_nodes: int"]}
            methods={["validate() → bool"]}
            color={colors.blue}
            delay={0.3}
          />

          {/* Component class */}
          <ClassBox
            x={20}
            y={170}
            w={180}
            h={100}
            name="Component"
            attrs={[
              "comp_type: int (R=1,L=2,C=3)",
              "node_a: int",
              "node_b: int",
              "value: float",
            ]}
            methods={[]}
            color={colors.cyan}
            delay={0.5}
          />

          {/* Circuit → Component (composition) */}
          <Arrow
            x1={110}
            y1={120}
            x2={110}
            y2={170}
            label="contient 1..6"
            delay={0.7}
          />

          {/* ===== SOLVER (center-left) ===== */}

          <ClassBox
            x={250}
            y={170}
            w={180}
            h={85}
            name="MNASolver"
            attrs={["frequencies: ndarray (100,)", "omega: ndarray"]}
            methods={["compute_impedance(c) → (2,100)"]}
            color={colors.yellow}
            delay={0.6}
          />

          {/* Component → Solver (utilisation) */}
          <Arrow
            x1={200}
            y1={210}
            x2={250}
            y2={210}
            label="utilise"
            dashed
            delay={0.8}
          />

          {/* ===== MODEL LAYER (center-right) ===== */}

          {/* CircuitTransformerV2 */}
          <ClassBox
            x={490}
            y={20}
            w={200}
            h={95}
            name="CircuitTransformerV2"
            attrs={[
              "encoder: EncoderCNN",
              "decoder: TransformerDecoder",
              "latent_dim: 256",
            ]}
            methods={["forward(z) → seq", "generate(z, tau) → seq"]}
            color={colors.green}
            delay={0.4}
          />

          {/* nn.Module label */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <rect
              x={545}
              y={2}
              width={90}
              height={16}
              rx="4"
              fill={`${colors.purple}15`}
              stroke={colors.purple}
              strokeWidth="0.8"
            />
            <text
              x={590}
              y={13}
              textAnchor="middle"
              fill={colors.purple}
              fontSize="8"
              fontFamily="monospace"
            >
              nn.Module
            </text>
          </motion.g>

          {/* EncoderCNN */}
          <ClassBox
            x={490}
            y={160}
            w={200}
            h={100}
            name="EncoderCNN"
            attrs={[
              "conv1: Conv1d(2→64, k=5)",
              "conv2: Conv1d(64→128, k=5)",
              "conv3: Conv1d(128→256, k=3)",
              "mlp: Linear(3072→256)",
            ]}
            methods={["forward(x) → latent(256)"]}
            color={colors.blue}
            delay={0.7}
          />

          {/* TransformerDecoder */}
          <ClassBox
            x={490}
            y={290}
            w={200}
            h={80}
            name="TransformerDecoder"
            attrs={[
              "layers: 6 × TransformerBlock",
              "d_model=512, nhead=8",
            ]}
            methods={["decode(latent, seq) → logits"]}
            color={colors.green}
            delay={0.8}
          />

          {/* Model → Encoder (composition) */}
          <Arrow
            x1={590}
            y1={115}
            x2={590}
            y2={160}
            label="encoder"
            delay={0.9}
          />

          {/* Model → Decoder */}
          <Arrow
            x1={590}
            y1={260}
            x2={590}
            y2={290}
            label="decoder"
            delay={1.0}
          />

          {/* ===== INFERENCE / BACKEND (right) ===== */}

          <ClassBox
            x={740}
            y={60}
            w={165}
            h={100}
            name="CircuitModel"
            attrs={[
              "model: TransformerV2",
              "device: mps | cuda",
              "freqs: ndarray (100,)",
            ]}
            methods={[
              "load(checkpoint)",
              "generate(Z, tau, N) → best",
            ]}
            color={colors.orange}
            delay={0.5}
          />

          {/* CircuitModel → Model (utilisation) */}
          <Arrow
            x1={740}
            y1={90}
            x2={690}
            y2={60}
            label="utilise"
            dashed
            delay={1.1}
          />

          {/* CircuitModel → Solver */}
          <Arrow
            x1={740}
            y1={145}
            x2={430}
            y2={200}
            label="compute Z(f)"
            dashed
            delay={1.2}
          />

          {/* ===== BACKEND API ===== */}
          <ClassBox
            x={740}
            y={210}
            w={165}
            h={80}
            name="FastAPI Backend"
            attrs={["port: 8000", "model: CircuitModel"]}
            methods={[
              "POST /generate",
              "POST /compute-impedance",
            ]}
            color={colors.purple}
            delay={0.9}
          />

          {/* Backend → CircuitModel */}
          <Arrow
            x1={822}
            y1={210}
            x2={822}
            y2={160}
            label=""
            delay={1.3}
          />

          {/* Legend */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {/* Composition */}
            <line x1={30} y1={340} x2={80} y2={340} stroke={colors.grayDark} strokeWidth="1" markerEnd="url(#arrowHead)" />
            <text x={85} y={343} fill={colors.gray} fontSize="7" fontFamily="monospace">
              composition (contient)
            </text>
            <text x={85} y={353} fill={colors.grayDark} fontSize="6" fontFamily="monospace">
              ex: Circuit contient Component[]
            </text>

            {/* Utilisation */}
            <line x1={300} y1={340} x2={350} y2={340} stroke={colors.grayDark} strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arrowHead)" />
            <text x={355} y={343} fill={colors.gray} fontSize="7" fontFamily="monospace">
              utilisation (dépend de)
            </text>
            <text x={355} y={353} fill={colors.grayDark} fontSize="6" fontFamily="monospace">
              ex: Backend utilise CircuitModel
            </text>

            {/* Héritage */}
            <rect x={570} y={332} width={55} height={14} rx="3" fill={`${colors.purple}15`} stroke={colors.purple} strokeWidth="0.6" />
            <text x={597} y={342} textAnchor="middle" fill={colors.purple} fontSize="7" fontFamily="monospace">nn.Module</text>
            <text x={632} y={343} fill={colors.gray} fontSize="7" fontFamily="monospace">
              héritage (classe parente)
            </text>
            <text x={632} y={353} fill={colors.grayDark} fontSize="6" fontFamily="monospace">
              ex: TransformerV2 hérite de nn.Module
            </text>
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
