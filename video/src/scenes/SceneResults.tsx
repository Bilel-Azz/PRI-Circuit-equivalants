import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { COLORS } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { GridBackground } from "../components/GridBackground";
import { SceneTitle } from "../components/SceneTitle";
import { MetricCard } from "../components/MetricCard";
import { SPRING_SMOOTH } from "../lib/animations";

// Generate two similar curves for comparison
function generateComparisonCurves(w: number, h: number, padX: number, padY: number) {
  const numPoints = 80;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  // Original curve
  const original: string[] = [];
  // Predicted curve (slightly different)
  const predicted: string[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const freq = t;

    // Original: RLC series resonance
    const magOrig =
      0.7 -
      0.5 * Math.exp(-((freq - 0.4) ** 2) / 0.008) +
      0.15 * freq;

    // Predicted: very close match
    const magPred =
      0.72 -
      0.48 * Math.exp(-((freq - 0.41) ** 2) / 0.009) +
      0.14 * freq;

    const xO = padX + t * plotW;
    const yO = padY + (1 - magOrig) * plotH;
    original.push(`${i === 0 ? "M" : "L"} ${xO.toFixed(1)} ${yO.toFixed(1)}`);

    const xP = padX + t * plotW;
    const yP = padY + (1 - magPred) * plotH;
    predicted.push(`${i === 0 ? "M" : "L"} ${xP.toFixed(1)} ${yP.toFixed(1)}`);
  }

  return {
    original: original.join(" "),
    predicted: predicted.join(" "),
  };
}

export const SceneResults: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const curves = generateComparisonCurves(600, 320, 50, 35);

  // Curve draw progress
  const curveProgress = interpolate(frame, [120, 220], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const origEvolve = evolvePath(curveProgress, curves.original);
  const predEvolve = evolvePath(
    interpolate(curveProgress, [0, 1], [0, 0.95], { extrapolateRight: "clamp" }),
    curves.predicted,
  );

  // Curve card appearance
  const curveCardProgress = spring({
    frame,
    fps,
    delay: 100,
    config: SPRING_SMOOTH,
  });

  // Legend
  const legendProgress = spring({
    frame,
    fps,
    delay: 230,
    config: SPRING_SMOOTH,
  });

  return (
    <AbsoluteFill>
      <GridBackground />
      <SceneTitle number={7} title="Résultats" />

      {/* Top: Metric cards */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 50,
        }}
      >
        <MetricCard
          value={99.8}
          suffix="%"
          label="Type Accuracy"
          color={COLORS.green}
          delay={20}
          decimals={1}
        />
        <MetricCard
          value={0}
          suffix="%"
          label="Self-loops"
          color={COLORS.blue}
          delay={40}
          decimals={0}
        />
        <MetricCard
          value={60}
          suffix="%"
          label="Circuits Valides"
          color={COLORS.orange}
          delay={60}
          decimals={0}
        />
      </div>

      {/* Bottom: Curve comparison */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          alignItems: "center",
          gap: 30,
          opacity: interpolate(curveCardProgress, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.bgCard,
            borderRadius: 20,
            padding: "24px 32px",
            border: `1px solid ${COLORS.gray700}`,
          }}
        >
          <svg width="600" height="320">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1={50}
                y1={35 + t * 250}
                x2={550}
                y2={35 + t * 250}
                stroke={COLORS.gray800}
                strokeWidth="1"
              />
            ))}

            {/* Axes */}
            <line
              x1={50}
              y1={35}
              x2={50}
              y2={285}
              stroke={COLORS.gray600}
              strokeWidth="1.5"
            />
            <line
              x1={50}
              y1={285}
              x2={550}
              y2={285}
              stroke={COLORS.gray600}
              strokeWidth="1.5"
            />

            {/* Original curve */}
            <path
              d={curves.original}
              fill="none"
              stroke={COLORS.blue}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={origEvolve.strokeDasharray}
              strokeDashoffset={origEvolve.strokeDashoffset}
              style={{ filter: `drop-shadow(0 0 6px ${COLORS.blue}40)` }}
            />

            {/* Predicted curve */}
            <path
              d={curves.predicted}
              fill="none"
              stroke={COLORS.green}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={predEvolve.strokeDasharray}
              strokeDashoffset={predEvolve.strokeDashoffset}
              opacity={0.9}
              style={{ filter: `drop-shadow(0 0 6px ${COLORS.green}40)` }}
            />

            {/* Axis labels */}
            <text
              x={35}
              y={45}
              textAnchor="end"
              fill={COLORS.gray500}
              fontSize="12"
              fontFamily={monoFontFamily}
            >
              |Z|
            </text>
            <text
              x={540}
              y={303}
              textAnchor="end"
              fill={COLORS.gray500}
              fontSize="12"
              fontFamily={monoFontFamily}
            >
              f (Hz)
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            opacity: interpolate(legendProgress, [0, 1], [0, 1]),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 3,
                backgroundColor: COLORS.blue,
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily,
                fontSize: 16,
                color: COLORS.gray300,
              }}
            >
              Z(f) original
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 3,
                backgroundColor: COLORS.green,
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily,
                fontSize: 16,
                color: COLORS.gray300,
              }}
            >
              Z(f) prédit
            </span>
          </div>
          <span
            style={{
              fontFamily,
              fontSize: 14,
              color: COLORS.gray500,
              marginTop: 8,
            }}
          >
            Best-of-50 sampling
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
