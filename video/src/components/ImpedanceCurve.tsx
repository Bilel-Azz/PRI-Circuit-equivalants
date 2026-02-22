import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { COLORS } from "../lib/theme";
import { monoFontFamily } from "../lib/fonts";

type Props = {
  delay?: number;
  drawDuration?: number; // frames
  width?: number;
  height?: number;
  showAxes?: boolean;
  showPhase?: boolean;
  color?: string;
  phaseColor?: string;
};

// Generate a realistic impedance magnitude curve (RLC series resonance)
function generateMagnitudePath(
  w: number,
  h: number,
  padX: number,
  padY: number,
): string {
  const points: string[] = [];
  const numPoints = 100;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    // Simulate log|Z| for RLC series: dip at resonance ~40%, rise at high f
    const freq = t;
    const magnitude =
      0.7 -
      0.5 * Math.exp(-((freq - 0.4) ** 2) / 0.008) +
      0.15 * freq;

    const x = padX + t * plotW;
    const y = padY + (1 - magnitude) * plotH;
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

// Generate phase curve
function generatePhasePath(
  w: number,
  h: number,
  padX: number,
  padY: number,
): string {
  const points: string[] = [];
  const numPoints = 100;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    // Phase goes from ~-80deg to 0 at resonance to ~+80deg
    const phase = Math.atan(15 * (t - 0.4)) / Math.PI + 0.5;

    const x = padX + t * plotW;
    const y = padY + (1 - phase) * plotH;
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

export const ImpedanceCurve: React.FC<Props> = ({
  delay = 0,
  drawDuration = 60,
  width = 700,
  height = 400,
  showAxes = true,
  showPhase = true,
  color = COLORS.blue,
  phaseColor = COLORS.orange,
}) => {
  const frame = useCurrentFrame();

  const padX = 60;
  const padY = 40;

  const magnitudePath = generateMagnitudePath(width, height, padX, padY);
  const phasePath = generatePhasePath(width, height, padX, padY);

  const drawProgress = interpolate(
    frame,
    [delay, delay + drawDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  const magEvolve = evolvePath(drawProgress, magnitudePath);
  const phaseEvolve = showPhase
    ? evolvePath(
        interpolate(drawProgress, [0, 1], [0, 0.9], {
          extrapolateRight: "clamp",
        }),
        phasePath,
      )
    : null;

  const axisOpacity = interpolate(frame, [delay, delay + 15], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg width={width} height={height}>
      {showAxes && (
        <g opacity={axisOpacity}>
          {/* Y axis */}
          <line
            x1={padX}
            y1={padY}
            x2={padX}
            y2={height - padY}
            stroke={COLORS.gray600}
            strokeWidth={1.5}
          />
          {/* X axis */}
          <line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke={COLORS.gray600}
            strokeWidth={1.5}
          />
          {/* Labels */}
          <text
            x={padX - 10}
            y={padY + 10}
            textAnchor="end"
            fill={COLORS.gray500}
            fontSize={13}
            fontFamily={monoFontFamily}
          >
            |Z|
          </text>
          <text
            x={width - padX}
            y={height - padY + 25}
            textAnchor="end"
            fill={COLORS.gray500}
            fontSize={13}
            fontFamily={monoFontFamily}
          >
            f (Hz)
          </text>
        </g>
      )}

      {/* Magnitude curve */}
      <path
        d={magnitudePath}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={magEvolve.strokeDasharray}
        strokeDashoffset={magEvolve.strokeDashoffset}
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      />

      {/* Phase curve */}
      {showPhase && phaseEvolve && (
        <path
          d={phasePath}
          fill="none"
          stroke={phaseColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={phaseEvolve.strokeDasharray}
          strokeDashoffset={phaseEvolve.strokeDashoffset}
          opacity={0.8}
          style={{ filter: `drop-shadow(0 0 6px ${phaseColor}40)` }}
        />
      )}
    </svg>
  );
};
