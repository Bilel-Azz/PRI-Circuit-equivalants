import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SITE } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { SPRING_SMOOTH } from "../lib/animations";

type Props = {
  siteFrame: number; // frame since site appeared
};

export const MockHeader: React.FC<Props> = ({ siteFrame }) => {
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(siteFrame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeProgress = spring({
    frame: siteFrame,
    fps,
    delay: 40,
    config: SPRING_SMOOTH,
  });

  return (
    <div
      style={{
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${SITE.border}`,
      }}
    >
      {/* Title */}
      <div style={{ opacity: titleOpacity }}>
        <h1
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 700,
            color: SITE.text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Circuit Synthesis{" "}
          <span style={{ color: SITE.accent }}>AI</span>
        </h1>
        <p
          style={{
            fontFamily,
            fontSize: 12,
            color: SITE.muted,
            margin: "2px 0 0 0",
          }}
        >
          Generate electrical equivalence from impedance curves
        </p>
      </div>

      {/* Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 100,
          backgroundColor: `${SITE.success}10`,
          border: `1px solid ${SITE.success}30`,
          opacity: interpolate(badgeProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(badgeProgress, [0, 1], [0.9, 1])})`,
        }}
      >
        {/* Pulsing dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: SITE.success,
          }}
        />
        <span
          style={{
            fontFamily: monoFontFamily,
            fontSize: 12,
            color: SITE.success,
            fontWeight: 500,
          }}
        >
          System Online
        </span>
        <span
          style={{
            fontFamily: monoFontFamily,
            fontSize: 11,
            color: SITE.mutedLight,
          }}
        >
          (gpu)
        </span>
      </div>
    </div>
  );
};
