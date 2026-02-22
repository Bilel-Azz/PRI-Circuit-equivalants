// Dark background for video
export const COLORS = {
  bg: "#0a0a1a",
  bgCard: "#111128",
  bgCardLight: "#1a1a3e",
  blue: "#3b82f6",
  blueLight: "#60a5fa",
  blueDark: "#1d4ed8",
  green: "#10b981",
  greenLight: "#34d399",
  orange: "#f59e0b",
  orangeLight: "#fbbf24",
  red: "#ef4444",
  redLight: "#f87171",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  white: "#ffffff",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gridLine: "rgba(59, 130, 246, 0.06)",
  gridLineBright: "rgba(59, 130, 246, 0.12)",
} as const;

// Website light theme colors (faithful to the real site)
export const SITE = {
  bg: "#f8fafd",
  card: "rgba(255,255,255,0.85)",
  cardSolid: "#ffffff",
  primary: "#3b82f6",
  primaryLight: "#dbeafe",
  accent: "#14b8a6",
  accentLight: "#ccfbf1",
  text: "#1e293b",
  textSecondary: "#475569",
  muted: "#64748b",
  mutedLight: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  success: "#22c55e",
  successLight: "#dcfce7",
  compR: "#f97316",
  compL: "#3b82f6",
  compC: "#10b981",
  shadow: "rgba(0,0,0,0.08)",
  gridPattern: "rgba(59, 130, 246, 0.04)",
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Demo composition: ~3m00s (matches voiceover audio)
export const DEMO_DURATION = 5390; // 179.6s @ 30fps

// Website mockup dimensions
export const SITE_WIDTH = 1500;
export const SITE_HEIGHT = 880;

// === TIMELINE (synced to voiceover) ===
// 0-270:       Title (9s)
// 270-2970:    Concept motion design pages (90s) — ~14s per page, synced to voiceover
// 2970-3090:   Transition / site reveal (4s)
// 3090-5110:   Site demo (67s) - siteFrame = frame - 3090, camera slowed for voiceover
//   3090-4760:  First cycle (sample → generate → results)
//   4760-5060:  Second input: JSON tab demo
// 5110-5390:   Outro (9s - slow zoom out + title)

export const CONCEPT_START = 270;
export const CONCEPT_END = 2970;
export const SITE_APPEAR = 2990;  // site starts fading in
export const SITE_READY = 3090;   // siteFrame 0 baseline
export const OUTRO_START = 5110;

// Camera keyframes — synced to voiceover pace
// UPDATED: reduced zoom levels for better framing (less cropped)
export const CAMERA_KEYFRAMES = [
  // Hold center during title + concept
  { frame: 0, scale: 0.82, x: 0, y: 0 },
  { frame: 2970, scale: 0.82, x: 0, y: 0 },
  // Site reveal
  { frame: 3010, scale: 0.7, x: 0, y: 0 },
  { frame: 3110, scale: 0.82, x: 0, y: 0 },
  // === FIRST CYCLE: sample selection ===
  // Zoom left panel (samples) — wider framing for context
  { frame: 3150, scale: 1.5, x: 20, y: 6 },
  { frame: 3340, scale: 1.5, x: 20, y: 6 },
  // Pan params + slider
  { frame: 3375, scale: 1.6, x: 18, y: -14 },
  { frame: 3520, scale: 1.6, x: 18, y: -14 },
  // Zoom button (click + loading)
  { frame: 3555, scale: 1.8, x: 18, y: -22 },
  { frame: 3820, scale: 1.8, x: 18, y: -22 },
  // Pan results (metrics) — wider view to see both panels
  { frame: 3870, scale: 1.3, x: -12, y: 5 },
  { frame: 4050, scale: 1.3, x: -12, y: 5 },
  // Zoom charts — moderate zoom
  { frame: 4100, scale: 1.6, x: -16, y: 8 },
  { frame: 4310, scale: 1.6, x: -16, y: 8 },
  // Zoom circuit — moderate zoom
  { frame: 4360, scale: 1.8, x: -18, y: -8 },
  { frame: 4610, scale: 1.8, x: -18, y: -8 },
  // Pan candidates
  { frame: 4650, scale: 1.5, x: -20, y: -24 },
  { frame: 4740, scale: 1.5, x: -20, y: -24 },
  // === SECOND CYCLE: JSON input ===
  // Zoom back to left panel (JSON tab) — wider
  { frame: 4790, scale: 1.5, x: 20, y: 6 },
  { frame: 5030, scale: 1.5, x: 20, y: 6 },
  // Zoom out + outro
  { frame: 5160, scale: 0.82, x: 0, y: 0 },
  { frame: 5390, scale: 0.82, x: 0, y: 0 },
] as const;

// Old slideshow scenes (kept for backward compat)
export const SCENES = {
  intro: 6 * FPS,
  problem: 10 * FPS,
  approach: 11 * FPS,
  representation: 10 * FPS,
  model: 15 * FPS,
  challenge: 10 * FPS,
  solution: 10 * FPS,
  results: 11 * FPS,
  outro: 12 * FPS,
} as const;

export const TRANSITION_DURATION = 20;
export const TOTAL_DURATION =
  Object.values(SCENES).reduce((a, b) => a + b, 0) -
  8 * TRANSITION_DURATION;
