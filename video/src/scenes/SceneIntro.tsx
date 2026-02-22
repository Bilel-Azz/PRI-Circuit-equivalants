import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { COLORS } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { GridBackground } from "../components/GridBackground";
import { SPRING_SNAPPY, SPRING_SMOOTH } from "../lib/animations";

// PCB-style trace paths for decoration
const TRACES = [
  "M 200 300 L 200 500 L 400 500 L 400 400 L 550 400",
  "M 1720 780 L 1720 600 L 1520 600 L 1520 700 L 1370 700",
  "M 300 800 L 500 800 L 500 700 L 650 700",
  "M 1620 280 L 1420 280 L 1420 380 L 1270 380",
];

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleScale = spring({
    frame,
    fps,
    delay: 15,
    config: SPRING_SNAPPY,
  });

  const titleOpacity = interpolate(
    spring({ frame, fps, delay: 10, config: SPRING_SMOOTH }),
    [0, 1],
    [0, 1],
  );

  // Subtitle
  const subtitleProgress = spring({
    frame,
    fps,
    delay: 40,
    config: SPRING_SMOOTH,
  });

  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Tag line
  const tagProgress = spring({
    frame,
    fps,
    delay: 60,
    config: SPRING_SMOOTH,
  });
  const tagOpacity = interpolate(tagProgress, [0, 1], [0, 1]);

  // PCB traces draw-in
  const traceProgress = interpolate(frame, [5, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Center glow pulse
  const glowIntensity = interpolate(
    frame,
    [30, 60, 90, 120, 150, 180],
    [0, 0.4, 0.3, 0.5, 0.3, 0.4],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill>
      <GridBackground />

      {/* PCB trace decorations */}
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {TRACES.map((path, i) => {
          const delay = i * 0.15;
          const p = interpolate(traceProgress, [delay, delay + 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const evolved = evolvePath(p, path);
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={COLORS.blue}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.3}
              strokeDasharray={evolved.strokeDasharray}
              strokeDashoffset={evolved.strokeDashoffset}
            />
          );
        })}

        {/* Dots at trace ends */}
        {traceProgress > 0.5 &&
          TRACES.map((_, i) => {
            const positions = [
              [550, 400],
              [1370, 700],
              [650, 700],
              [1270, 380],
            ];
            const dotOpacity = interpolate(
              traceProgress,
              [0.5 + i * 0.1, 0.7 + i * 0.1],
              [0, 0.6],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <circle
                key={`dot-${i}`}
                cx={positions[i][0]}
                cy={positions[i][1]}
                r={4}
                fill={COLORS.blue}
                opacity={dotOpacity}
              />
            );
          })}
      </svg>

      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.blue}${Math.round(glowIntensity * 20).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        }}
      />

      {/* Main title */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -55%) scale(${interpolate(titleScale, [0, 1], [0.7, 1])})`,
          opacity: titleOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Circuit icon */}
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={COLORS.blue}
            strokeWidth="2"
            opacity={0.5}
          />
          <circle
            cx="40"
            cy="40"
            r="6"
            fill={COLORS.blue}
            opacity={0.8}
          />
          {/* Connection points */}
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1={40 + 10 * Math.cos(rad)}
                y1={40 + 10 * Math.sin(rad)}
                x2={40 + 30 * Math.cos(rad)}
                y2={40 + 30 * Math.sin(rad)}
                stroke={COLORS.blue}
                strokeWidth="2"
                opacity={0.6}
              />
            );
          })}
        </svg>

        <h1
          style={{
            fontFamily,
            fontSize: 82,
            fontWeight: 800,
            color: COLORS.white,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Circuit Synthesis
          <span style={{ color: COLORS.blue }}> AI</span>
        </h1>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: "64%",
          left: "50%",
          transform: `translate(-50%, 0) translateY(${subtitleY}px)`,
          opacity: subtitleOpacity,
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 400,
            color: COLORS.gray400,
            textAlign: "center",
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          De la courbe d'impédance au circuit équivalent
        </p>
      </div>

      {/* Tech tag */}
      <div
        style={{
          position: "absolute",
          top: "72%",
          left: "50%",
          transform: "translate(-50%, 0)",
          opacity: tagOpacity,
          display: "flex",
          gap: 16,
        }}
      >
        {["PyTorch", "CNN", "Transformer", "MNA Solver"].map((tag, i) => {
          const tagDelay = 65 + i * 8;
          const tagP = spring({
            frame,
            fps,
            delay: tagDelay,
            config: SPRING_SMOOTH,
          });
          return (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                border: `1px solid ${COLORS.gray600}`,
                backgroundColor: `${COLORS.bgCard}80`,
                opacity: interpolate(tagP, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(tagP, [0, 1], [15, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: monoFontFamily,
                  fontSize: 15,
                  color: COLORS.gray300,
                }}
              >
                {tag}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
