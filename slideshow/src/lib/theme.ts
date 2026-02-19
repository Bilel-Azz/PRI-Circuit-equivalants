// Colors from the Circuit Synthesis AI project
export const colors = {
  bg: "#0a0a0f",
  bgCard: "#12121a",
  bgCardHover: "#1a1a2e",

  // Primary accent
  blue: "#4f8fff",
  blueGlow: "rgba(79, 143, 255, 0.3)",
  blueDim: "#2a5ab8",

  // Component colors
  resistor: "#ef4444",   // red-500
  inductor: "#22c55e",   // green-500
  capacitor: "#3b82f6",  // blue-500

  // UI
  cyan: "#22d3ee",
  green: "#4ade80",
  yellow: "#facc15",
  purple: "#a78bfa",
  orange: "#fb923c",
  pink: "#f472b6",
  white: "#f0f0f5",
  gray: "#d1d5db",
  grayLight: "#e8eaed",
  grayDark: "#374151",
  border: "#1e293b",
} as const;

// Spring presets matching the Remotion video feel
export const springs = {
  smooth: { type: "spring" as const, damping: 25, stiffness: 120 },
  snappy: { type: "spring" as const, damping: 15, stiffness: 300 },
  bouncy: { type: "spring" as const, damping: 10, stiffness: 200 },
  gentle: { type: "spring" as const, damping: 30, stiffness: 80 },
};
