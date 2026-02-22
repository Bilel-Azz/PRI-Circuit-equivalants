import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// Spring presets
export const SPRING_SMOOTH = { damping: 200 };
export const SPRING_SNAPPY = { damping: 20, stiffness: 200 };
export const SPRING_BOUNCY = { damping: 8 };
export const SPRING_HEAVY = { damping: 15, stiffness: 80, mass: 2 };

// Helper: spring animation with delay
export function useSpring(delay: number = 0, config = SPRING_SMOOTH) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, delay, config });
}

// Helper: spring animation mapped to a range
export function useSpringRange(
  inputRange: [number, number],
  delay: number = 0,
  config = SPRING_SMOOTH,
) {
  const progress = useSpring(delay, config);
  return interpolate(progress, [0, 1], inputRange);
}

// Helper: fade in then out
export function useFadeInOut(
  fadeInEnd: number,
  fadeOutStart: number,
  totalDuration: number,
) {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeInEnd, fadeOutStart, totalDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}
