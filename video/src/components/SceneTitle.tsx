import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../lib/theme";
import { fontFamily } from "../lib/fonts";
import { SPRING_SNAPPY } from "../lib/animations";

type Props = {
  number: number;
  title: string;
  delay?: number;
};

export const SceneTitle: React.FC<Props> = ({ number, title, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeProgress = spring({
    frame,
    fps,
    delay,
    config: SPRING_SNAPPY,
  });

  const titleProgress = spring({
    frame,
    fps,
    delay: delay + 8,
    config: { damping: 200 },
  });

  const badgeScale = interpolate(badgeProgress, [0, 1], [0, 1]);
  const badgeOpacity = interpolate(badgeProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleX = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        position: "absolute",
        top: 60,
        left: 80,
      }}
    >
      {/* Number badge */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: COLORS.blue,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
          boxShadow: `0 0 30px ${COLORS.blue}40`,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.white,
          }}
        >
          {String(number).padStart(2, "0")}
        </span>
      </div>

      {/* Title */}
      <span
        style={{
          fontFamily,
          fontSize: 36,
          fontWeight: 600,
          color: COLORS.gray200,
          transform: `translateX(${titleX}px)`,
          opacity: titleOpacity,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </span>
    </div>
  );
};
