import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { monoFontFamily } from "../lib/fonts";
import { COLORS } from "../lib/theme";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delay?: number;
  duration?: number; // in frames
  color?: string;
  fontSize?: number;
};

export const AnimatedCounter: React.FC<Props> = ({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  delay = 0,
  duration = 60,
  color = COLORS.white,
  fontSize = 96,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const currentValue = progress * value;
  const display = currentValue.toFixed(decimals);

  return (
    <span
      style={{
        fontFamily: monoFontFamily,
        fontSize,
        fontWeight: 700,
        color,
        letterSpacing: "-0.03em",
      }}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
};
