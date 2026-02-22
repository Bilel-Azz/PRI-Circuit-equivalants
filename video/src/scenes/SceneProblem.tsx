import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { COLORS } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { GridBackground } from "../components/GridBackground";
import { SceneTitle } from "../components/SceneTitle";
import { ImpedanceCurve } from "../components/ImpedanceCurve";
import { SPRING_SMOOTH, SPRING_SNAPPY } from "../lib/animations";

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Question mark animation
  const qProgress = spring({
    frame,
    fps,
    delay: 90,
    config: SPRING_SNAPPY,
  });

  const qScale = interpolate(qProgress, [0, 1], [0, 1]);
  const qOpacity = interpolate(qProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Arrow animation
  const arrowProgress = spring({
    frame,
    fps,
    delay: 120,
    config: SPRING_SMOOTH,
  });

  // Circuit placeholder (right side)
  const circuitProgress = spring({
    frame,
    fps,
    delay: 140,
    config: SPRING_SMOOTH,
  });

  const circuitOpacity = interpolate(circuitProgress, [0, 1], [0, 1]);
  const circuitScale = interpolate(circuitProgress, [0, 1], [0.9, 1]);

  // Bottom text
  const textProgress = spring({
    frame,
    fps,
    delay: 170,
    config: SPRING_SMOOTH,
  });

  return (
    <AbsoluteFill>
      <GridBackground />
      <SceneTitle number={1} title="Le Problème" />

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        {/* Left: Impedance curve */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: `${COLORS.bgCard}cc`,
              borderRadius: 20,
              padding: "24px 32px",
              border: `1px solid ${COLORS.gray700}`,
            }}
          >
            <ImpedanceCurve
              delay={15}
              drawDuration={80}
              width={550}
              height={350}
              showPhase={true}
            />
          </div>
          <span
            style={{
              fontFamily: monoFontFamily,
              fontSize: 18,
              color: COLORS.gray400,
              opacity: interpolate(frame, [60, 80], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Z(f) = |Z| e^(jφ)
          </span>
        </div>

        {/* Center: Question mark + Arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Arrow */}
          <svg width="120" height="60" style={{ opacity: arrowProgress }}>
            <defs>
              <linearGradient id="arrowGrad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0.3" />
                <stop offset="100%" stopColor={COLORS.blue} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <line
              x1="10"
              y1="30"
              x2="90"
              y2="30"
              stroke="url(#arrowGrad)"
              strokeWidth="3"
              strokeDasharray={`${arrowProgress * 80} 80`}
            />
            <polygon
              points="85,20 105,30 85,40"
              fill={COLORS.blue}
              opacity={interpolate(arrowProgress, [0.7, 1], [0, 0.8], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          </svg>

          {/* Question mark */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: `${COLORS.red}20`,
              border: `2px solid ${COLORS.red}60`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${qScale})`,
              opacity: qOpacity,
              boxShadow: `0 0 40px ${COLORS.red}30`,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 48,
                fontWeight: 800,
                color: COLORS.red,
              }}
            >
              ?
            </span>
          </div>
        </div>

        {/* Right: Circuit placeholder */}
        <div
          style={{
            opacity: circuitOpacity,
            transform: `scale(${circuitScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 400,
              height: 350,
              backgroundColor: `${COLORS.bgCard}cc`,
              borderRadius: 20,
              border: `1px dashed ${COLORS.gray600}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {/* Simple circuit sketch */}
            <svg width="300" height="120" viewBox="0 0 300 120">
              <line
                x1="20"
                y1="60"
                x2="80"
                y2="60"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />
              <rect
                x="80"
                y="48"
                width="45"
                height="24"
                fill="none"
                stroke={COLORS.blue}
                strokeWidth="2"
                rx="3"
              />
              <line
                x1="125"
                y1="60"
                x2="155"
                y2="60"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />
              {/* Inductor bumps */}
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M ${155 + i * 14} 60 A 7 7 0 0 1 ${155 + (i + 1) * 14} 60`}
                  fill="none"
                  stroke={COLORS.green}
                  strokeWidth="2"
                />
              ))}
              <line
                x1="211"
                y1="60"
                x2="240"
                y2="60"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />
              {/* Capacitor */}
              <line
                x1="237"
                y1="44"
                x2="237"
                y2="76"
                stroke={COLORS.orange}
                strokeWidth="3"
              />
              <line
                x1="247"
                y1="44"
                x2="247"
                y2="76"
                stroke={COLORS.orange}
                strokeWidth="3"
              />
              <line
                x1="247"
                y1="60"
                x2="280"
                y2="60"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />
            </svg>

            <div style={{ display: "flex", gap: 12 }}>
              {["R = ?Ω", "L = ?H", "C = ?F"].map((text, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 16,
                    color: [COLORS.blue, COLORS.green, COLORS.orange][i],
                    padding: "4px 12px",
                    borderRadius: 8,
                    backgroundColor: `${[COLORS.blue, COLORS.green, COLORS.orange][i]}15`,
                  }}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>

          <span
            style={{
              fontFamily,
              fontSize: 18,
              color: COLORS.gray400,
            }}
          >
            Circuit RLC équivalent
          </span>
        </div>
      </div>

      {/* Bottom question */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: "50%",
          transform: "translate(-50%, 0)",
          opacity: interpolate(textProgress, [0, 1], [0, 1]),
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.gray300,
            textAlign: "center",
            margin: 0,
          }}
        >
          Comment identifier automatiquement le circuit
          <span style={{ color: COLORS.blue }}> à partir de Z(f)</span> ?
        </p>
      </div>
    </AbsoluteFill>
  );
};
