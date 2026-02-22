import { interpolate, Easing } from "remotion";
import { evolvePath } from "@remotion/paths";
import { SITE } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";

type Props = {
  siteFrame: number;
  width?: number;
  height?: number;
};

// Generate RLC series resonance magnitude curve
function genMagnitudePath(w: number, h: number, px: number, py: number): string {
  const pts: string[] = [];
  const n = 80;
  const pw = w - px * 2;
  const ph = h - py * 2;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const mag = 0.75 - 0.55 * Math.exp(-((t - 0.38) ** 2) / 0.007) + 0.12 * t;
    const x = px + t * pw;
    const y = py + (1 - mag) * ph;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

// Generate predicted magnitude (close match)
function genPredictedPath(w: number, h: number, px: number, py: number): string {
  const pts: string[] = [];
  const n = 80;
  const pw = w - px * 2;
  const ph = h - py * 2;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const mag = 0.76 - 0.53 * Math.exp(-((t - 0.39) ** 2) / 0.0075) + 0.11 * t;
    const x = px + t * pw;
    const y = py + (1 - mag) * ph;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

// Generate phase curve
function genPhasePath(w: number, h: number, px: number, py: number): string {
  const pts: string[] = [];
  const n = 80;
  const pw = w - px * 2;
  const ph = h - py * 2;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const phase = Math.atan(20 * (t - 0.38)) / Math.PI + 0.5;
    const x = px + t * pw;
    const y = py + (1 - phase) * ph;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

// Generate predicted phase
function genPredPhasePath(w: number, h: number, px: number, py: number): string {
  const pts: string[] = [];
  const n = 80;
  const pw = w - px * 2;
  const ph = h - py * 2;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const phase = Math.atan(18 * (t - 0.39)) / Math.PI + 0.5;
    const x = px + t * pw;
    const y = py + (1 - phase) * ph;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export const MockChart: React.FC<Props> = ({
  siteFrame,
  width = 430,
  height = 200,
}) => {
  const px = 45;
  const py = 28;

  // Charts appear with results
  const chartAppear = interpolate(siteFrame, [500, 520], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Target curve draws: siteFrame 720-790
  const targetDraw = interpolate(siteFrame, [720, 790], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Predicted curve draws after target
  const predDraw = interpolate(siteFrame, [800, 870], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const magTarget = genMagnitudePath(width / 2 - 8, height, px, py);
  const magPred = genPredictedPath(width / 2 - 8, height, px, py);
  const phaseTarget = genPhasePath(width / 2 - 8, height, px, py);
  const phasePred = genPredPhasePath(width / 2 - 8, height, px, py);

  const magTargetEvolve = evolvePath(targetDraw, magTarget);
  const magPredEvolve = evolvePath(predDraw, magPred);
  const phaseTargetEvolve = evolvePath(targetDraw, phaseTarget);
  const phasePredEvolve = evolvePath(predDraw, phasePred);

  // Match badge
  const badgeAppear = interpolate(siteFrame, [880, 895], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cw = width / 2 - 8;

  return (
    <div style={{ opacity: chartAppear }}>
      {/* Chart title + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 13,
            fontWeight: 600,
            color: SITE.text,
          }}
        >
          Impedance Response
        </span>
        {badgeAppear > 0 && (
          <div
            style={{
              padding: "3px 10px",
              borderRadius: 100,
              backgroundColor: SITE.successLight,
              border: `1px solid ${SITE.success}30`,
              opacity: badgeAppear,
              transform: `scale(${interpolate(badgeAppear, [0, 1], [0.5, 1])})`,
            }}
          >
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 11,
                fontWeight: 600,
                color: SITE.success,
              }}
            >
              Match: 94%
            </span>
          </div>
        )}
      </div>

      {/* Two charts side by side */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* Magnitude chart */}
        <div
          style={{
            backgroundColor: SITE.cardSolid,
            borderRadius: 10,
            border: `1px solid ${SITE.border}`,
            padding: "8px 4px 4px 4px",
          }}
        >
          <span
            style={{
              fontFamily: monoFontFamily,
              fontSize: 10,
              color: SITE.muted,
              marginLeft: 8,
            }}
          >
            Magnitude (log₁₀|Z|)
          </span>
          <svg width={cw} height={height}>
            {/* Grid */}
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1={px}
                y1={py + t * (height - py * 2)}
                x2={cw - 10}
                y2={py + t * (height - py * 2)}
                stroke={SITE.border}
                strokeWidth="0.5"
              />
            ))}
            <line
              x1={px}
              y1={height - py}
              x2={cw - 10}
              y2={height - py}
              stroke={SITE.border}
              strokeWidth="1"
            />
            <line
              x1={px}
              y1={py}
              x2={px}
              y2={height - py}
              stroke={SITE.border}
              strokeWidth="1"
            />
            {/* Target */}
            <path
              d={magTarget}
              fill="none"
              stroke={SITE.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={magTargetEvolve.strokeDasharray}
              strokeDashoffset={magTargetEvolve.strokeDashoffset}
            />
            {/* Predicted */}
            <path
              d={magPred}
              fill="none"
              stroke={SITE.compR}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`4 3`}
              opacity={predDraw}
            />
            {/* Axis labels */}
            {["1", "10", "100", "1k", "10k", "100k"].map((l, i) => (
              <text
                key={l}
                x={px + (i / 5) * (cw - px - 10)}
                y={height - py + 14}
                textAnchor="middle"
                fill={SITE.muted}
                fontSize="8"
                fontFamily={monoFontFamily}
              >
                {l}
              </text>
            ))}
          </svg>
        </div>

        {/* Phase chart */}
        <div
          style={{
            backgroundColor: SITE.cardSolid,
            borderRadius: 10,
            border: `1px solid ${SITE.border}`,
            padding: "8px 4px 4px 4px",
          }}
        >
          <span
            style={{
              fontFamily: monoFontFamily,
              fontSize: 10,
              color: SITE.muted,
              marginLeft: 8,
            }}
          >
            Phase (degrees)
          </span>
          <svg width={cw} height={height}>
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1={px}
                y1={py + t * (height - py * 2)}
                x2={cw - 10}
                y2={py + t * (height - py * 2)}
                stroke={SITE.border}
                strokeWidth="0.5"
              />
            ))}
            <line
              x1={px}
              y1={height - py}
              x2={cw - 10}
              y2={height - py}
              stroke={SITE.border}
              strokeWidth="1"
            />
            <line
              x1={px}
              y1={py}
              x2={px}
              y2={height - py}
              stroke={SITE.border}
              strokeWidth="1"
            />
            <path
              d={phaseTarget}
              fill="none"
              stroke={SITE.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={phaseTargetEvolve.strokeDasharray}
              strokeDashoffset={phaseTargetEvolve.strokeDashoffset}
            />
            <path
              d={phasePred}
              fill="none"
              stroke={SITE.compR}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`4 3`}
              opacity={predDraw}
            />
            {["-90°", "-45°", "0°", "45°", "90°"].map((l, i) => (
              <text
                key={l}
                x={px - 6}
                y={py + (i / 4) * (height - py * 2) + 4}
                textAnchor="end"
                fill={SITE.muted}
                fontSize="8"
                fontFamily={monoFontFamily}
              >
                {l}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 8,
          justifyContent: "center",
          opacity: targetDraw > 0.5 ? 1 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 16,
              height: 2.5,
              backgroundColor: SITE.primary,
              borderRadius: 2,
            }}
          />
          <span style={{ fontFamily, fontSize: 10, color: SITE.muted }}>
            Target (Input)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 16,
              height: 2.5,
              backgroundColor: SITE.compR,
              borderRadius: 2,
            }}
          />
          <span style={{ fontFamily, fontSize: 10, color: SITE.muted }}>
            Circuit Generated
          </span>
        </div>
      </div>
    </div>
  );
};
