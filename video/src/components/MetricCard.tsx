import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../lib/theme";
import { fontFamily } from "../lib/fonts";
import { AnimatedCounter } from "./AnimatedCounter";
import { SPRING_SNAPPY } from "../lib/animations";

type Props = {
  value: number;
  suffix?: string;
  label: string;
  color?: string;
  delay?: number;
  decimals?: number;
};

export const MetricCard: React.FC<Props> = ({
  value,
  suffix = "%",
  label,
  color = COLORS.blue,
  delay = 0,
  decimals = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardProgress = spring({
    frame,
    fps,
    delay,
    config: SPRING_SNAPPY,
  });

  const scale = interpolate(cardProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(cardProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "40px 48px",
        backgroundColor: COLORS.bgCard,
        borderRadius: 24,
        border: `1px solid ${color}30`,
        transform: `scale(${scale})`,
        opacity,
        boxShadow: `0 0 40px ${color}15`,
      }}
    >
      <AnimatedCounter
        value={value}
        suffix={suffix}
        decimals={decimals}
        delay={delay + 10}
        color={color}
        fontSize={72}
      />
      <span
        style={{
          fontFamily,
          fontSize: 22,
          fontWeight: 500,
          color: COLORS.gray400,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
    </div>
  );
};
