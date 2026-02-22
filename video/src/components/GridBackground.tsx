import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../lib/theme";

export const GridBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle grid scroll
  const offsetY = interpolate(frame, [0, 900], [0, -40], {
    extrapolateRight: "extend",
  });

  const gridSize = 60;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Grid lines */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translateY(${offsetY}px)`,
        }}
      >
        {/* Vertical lines */}
        {Array.from({ length: Math.ceil(1920 / gridSize) + 1 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * gridSize}
            y1={0}
            x2={i * gridSize}
            y2={1200}
            stroke={COLORS.gridLine}
            strokeWidth={1}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: Math.ceil(1200 / gridSize) + 1 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * gridSize}
            x2={1920}
            y2={i * gridSize}
            stroke={COLORS.gridLine}
            strokeWidth={1}
          />
        ))}
        {/* Bright center cross */}
        <line
          x1={960}
          y1={0}
          x2={960}
          y2={1200}
          stroke={COLORS.gridLineBright}
          strokeWidth={1}
        />
        <line
          x1={0}
          y1={540}
          x2={1920}
          y2={540}
          stroke={COLORS.gridLineBright}
          strokeWidth={1}
        />
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
