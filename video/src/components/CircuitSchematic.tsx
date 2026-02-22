import {
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { COLORS } from "../lib/theme";
import { monoFontFamily, fontFamily } from "../lib/fonts";
import { SPRING_SMOOTH } from "../lib/animations";

type ComponentType = "R" | "L" | "C";

type CircuitComponent = {
  type: ComponentType;
  x: number;
  y: number;
  horizontal?: boolean;
  label?: string;
};

type Props = {
  components?: CircuitComponent[];
  delay?: number;
  width?: number;
  height?: number;
  simple?: boolean; // Use simple preset
};

const COMP_COLORS: Record<ComponentType, string> = {
  R: COLORS.blue,
  L: COLORS.green,
  C: COLORS.orange,
};

// Draw a resistor symbol
function ResistorSymbol({
  x,
  y,
  color,
  opacity,
}: {
  x: number;
  y: number;
  color: string;
  opacity: number;
}) {
  const w = 50;
  const h = 16;
  return (
    <g opacity={opacity}>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        rx={3}
      />
      <text
        x={x}
        y={y - h / 2 - 8}
        textAnchor="middle"
        fill={color}
        fontSize={14}
        fontFamily={monoFontFamily}
        fontWeight={600}
      >
        R
      </text>
    </g>
  );
}

// Draw an inductor symbol (bumps)
function InductorSymbol({
  x,
  y,
  color,
  opacity,
}: {
  x: number;
  y: number;
  color: string;
  opacity: number;
}) {
  const bumps = 4;
  const bumpR = 7;
  const totalW = bumps * bumpR * 2;

  return (
    <g opacity={opacity}>
      {Array.from({ length: bumps }).map((_, i) => (
        <path
          key={i}
          d={`M ${x - totalW / 2 + i * bumpR * 2} ${y} A ${bumpR} ${bumpR} 0 0 1 ${x - totalW / 2 + (i + 1) * bumpR * 2} ${y}`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
        />
      ))}
      <text
        x={x}
        y={y - 16}
        textAnchor="middle"
        fill={color}
        fontSize={14}
        fontFamily={monoFontFamily}
        fontWeight={600}
      >
        L
      </text>
    </g>
  );
}

// Draw a capacitor symbol (two parallel lines)
function CapacitorSymbol({
  x,
  y,
  color,
  opacity,
}: {
  x: number;
  y: number;
  color: string;
  opacity: number;
}) {
  const gap = 8;
  const h = 24;
  return (
    <g opacity={opacity}>
      <line
        x1={x - gap / 2}
        y1={y - h / 2}
        x2={x - gap / 2}
        y2={y + h / 2}
        stroke={color}
        strokeWidth={3}
      />
      <line
        x1={x + gap / 2}
        y1={y - h / 2}
        x2={x + gap / 2}
        y2={y + h / 2}
        stroke={color}
        strokeWidth={3}
      />
      <text
        x={x}
        y={y - h / 2 - 8}
        textAnchor="middle"
        fill={color}
        fontSize={14}
        fontFamily={monoFontFamily}
        fontWeight={600}
      >
        C
      </text>
    </g>
  );
}

// Simple RLC series circuit preset
function SimpleRLCCircuit({
  delay,
  width,
  height,
}: {
  delay: number;
  width: number;
  height: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wireProgress = spring({
    frame,
    fps,
    delay,
    config: SPRING_SMOOTH,
  });

  const cx = width / 2;
  const cy = height / 2;
  const spacing = 120;

  // Staggered component appearances
  const rOpacity = interpolate(
    spring({ frame, fps, delay: delay + 10, config: SPRING_SMOOTH }),
    [0, 1],
    [0, 1],
  );
  const lOpacity = interpolate(
    spring({ frame, fps, delay: delay + 20, config: SPRING_SMOOTH }),
    [0, 1],
    [0, 1],
  );
  const cOpacity = interpolate(
    spring({ frame, fps, delay: delay + 30, config: SPRING_SMOOTH }),
    [0, 1],
    [0, 1],
  );

  const wireOpacity = interpolate(wireProgress, [0, 1], [0, 0.5]);

  return (
    <svg width={width} height={height}>
      {/* Wire connections */}
      <g opacity={wireOpacity}>
        {/* Input terminal */}
        <circle cx={cx - spacing * 1.8} cy={cy} r={5} fill={COLORS.gray400} />
        <line
          x1={cx - spacing * 1.8}
          y1={cy}
          x2={cx - spacing - 30}
          y2={cy}
          stroke={COLORS.gray500}
          strokeWidth={2}
        />
        {/* Between R and L */}
        <line
          x1={cx - spacing + 30}
          y1={cy}
          x2={cx - 30}
          y2={cy}
          stroke={COLORS.gray500}
          strokeWidth={2}
        />
        {/* Between L and C */}
        <line
          x1={cx + 30}
          y1={cy}
          x2={cx + spacing - 10}
          y2={cy}
          stroke={COLORS.gray500}
          strokeWidth={2}
        />
        {/* Output */}
        <line
          x1={cx + spacing + 10}
          y1={cy}
          x2={cx + spacing * 1.8}
          y2={cy}
          stroke={COLORS.gray500}
          strokeWidth={2}
        />
        <circle cx={cx + spacing * 1.8} cy={cy} r={5} fill={COLORS.gray400} />
      </g>

      {/* Labels */}
      <text
        x={cx - spacing * 1.8 - 10}
        y={cy + 5}
        textAnchor="end"
        fill={COLORS.gray400}
        fontSize={16}
        fontFamily={fontFamily}
        opacity={wireOpacity * 2}
      >
        IN
      </text>
      <text
        x={cx + spacing * 1.8 + 10}
        y={cy + 5}
        textAnchor="start"
        fill={COLORS.gray400}
        fontSize={16}
        fontFamily={fontFamily}
        opacity={wireOpacity * 2}
      >
        GND
      </text>

      {/* Components */}
      <ResistorSymbol
        x={cx - spacing}
        y={cy}
        color={COMP_COLORS.R}
        opacity={rOpacity}
      />
      <InductorSymbol
        x={cx}
        y={cy}
        color={COMP_COLORS.L}
        opacity={lOpacity}
      />
      <CapacitorSymbol
        x={cx + spacing}
        y={cy}
        color={COMP_COLORS.C}
        opacity={cOpacity}
      />
    </svg>
  );
}

export const CircuitSchematic: React.FC<Props> = ({
  delay = 0,
  width = 600,
  height = 200,
  simple = true,
}) => {
  if (simple) {
    return <SimpleRLCCircuit delay={delay} width={width} height={height} />;
  }

  return <SimpleRLCCircuit delay={delay} width={width} height={height} />;
};
