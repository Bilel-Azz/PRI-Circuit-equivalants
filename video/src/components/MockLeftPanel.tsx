import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { SITE } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { SPRING_SMOOTH, SPRING_SNAPPY } from "../lib/animations";

type Props = {
  siteFrame: number;
};

const SAMPLES = [
  { icon: "📉", name: "Filtre RC Passe-Bas", desc: "R=1kΩ, C=100nF" },
  { icon: "📊", name: "Circuit RLC Résonant", desc: "R=47Ω, L=2.2mH, C=470nF" },
  { icon: "📈", name: "Tank LC Parallèle", desc: "L=1mH, C=1μF, R=10Ω" },
  { icon: "📶", name: "Filtre RL Passe-Haut", desc: "R=100Ω, L=10mH" },
  { icon: "🔌", name: "Réseau RC Parallèle", desc: "R=220Ω, C=47nF" },
  { icon: "🪜", name: "Ladder RC 2 étages", desc: "R1=R2=1kΩ, C1=C2=10nF" },
];

// JSON data that appears in the JSON tab
const JSON_LINES = [
  '{ "frequency": [10, 31, 100, 316,',
  '    1000, 3162, 10000, 31623, 100000],',
  '  "magnitude": [2.14, 1.87, 0.92,',
  '    0.31, 0.89, 1.42, 1.78, 2.05, 2.31],',
  '  "phase": [-78, -62, -45, -12,',
  '    2, 28, 41, 52, 61] }',
];

export const MockLeftPanel: React.FC<Props> = ({ siteFrame }) => {
  const { fps } = useVideoConfig();

  // === COMPRESSED TIMELINE ===
  // Samples: 8-35 | Selection: 85-95 | Slider: 220-248
  // Button: 330-355 | Loading: 355-500 | Results: 500+
  // JSON tab: 1410+ | JSON generate: 1520

  // --- JSON tab switch (siteFrame 1410) ---
  const jsonTabProgress = interpolate(siteFrame, [1410, 1420], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showJsonTab = siteFrame >= 1410;

  // Section header appearance
  const headerOpacity = interpolate(siteFrame, [5, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sample cards (fast stagger)
  const sampleAppear = (i: number) => {
    const delay = 8 + i * 4;
    return spring({ frame: siteFrame, fps, delay, config: SPRING_SNAPPY });
  };

  // Selection
  const selectionProgress = interpolate(siteFrame, [85, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Data loaded
  const dataLoadedProgress = spring({
    frame: siteFrame,
    fps,
    delay: 110,
    config: SPRING_SNAPPY,
  });

  // Parameters
  const paramsOpacity = interpolate(siteFrame, [25, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slider: 10->50
  const candidatesValue = interpolate(siteFrame, [220, 248], [10, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const candidatesThumb = interpolate(candidatesValue, [1, 50], [0, 100]);

  const tempValue = 0.8;
  const tempThumb = interpolate(tempValue, [0.1, 2.0], [0, 100]);

  // Button
  const buttonOpacity = interpolate(siteFrame, [38, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // First button click
  const buttonGlow = interpolate(siteFrame, [330, 342, 350, 355], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonScale = interpolate(siteFrame, [342, 348, 355], [1, 0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // First loading
  const isLoading = siteFrame > 355 && siteFrame < 500;
  const loadingOpacity = interpolate(siteFrame, [355, 365], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spinnerAngle = siteFrame > 355 ? (siteFrame - 355) * 10 : 0;

  // === JSON TAB ANIMATIONS ===
  const jsonContentAppear = spring({
    frame: siteFrame,
    fps,
    delay: 1425,
    config: SPRING_SMOOTH,
  });

  // JSON lines appear with stagger
  const jsonLineAppear = (i: number) => {
    const delay = 1430 + i * 6;
    return spring({ frame: siteFrame, fps, delay, config: SPRING_SNAPPY });
  };

  // JSON "data loaded" badge
  const jsonLoadedAppear = spring({
    frame: siteFrame,
    fps,
    delay: 1480,
    config: SPRING_SNAPPY,
  });

  // Second button click (JSON generate)
  const jsonButtonGlow = interpolate(siteFrame, [1520, 1530, 1538, 1543], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jsonButtonScale = interpolate(siteFrame, [1530, 1536, 1543], [1, 0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isJsonLoading = siteFrame > 1543 && siteFrame < 1640;
  const jsonLoadingOpacity = interpolate(siteFrame, [1543, 1550], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jsonSpinnerAngle = siteFrame > 1543 ? (siteFrame - 1543) * 10 : 0;

  // Combined button state
  const anyLoading = isLoading || isJsonLoading;
  const combinedGlow = Math.max(buttonGlow, jsonButtonGlow);
  const combinedScale = isLoading || isJsonLoading ? 1 : Math.min(buttonScale, jsonButtonScale);
  const combinedLoadingOpacity = isLoading ? loadingOpacity : isJsonLoading ? jsonLoadingOpacity : 0;
  const combinedSpinner = isLoading ? spinnerAngle : jsonSpinnerAngle;

  return (
    <>
      {/* Input Configuration Card */}
      <div
        style={{
          backgroundColor: SITE.card,
          borderRadius: 12,
          border: `1px solid ${SITE.border}`,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: headerOpacity,
          }}
        >
          <span style={{ fontSize: 14 }}>{"⚡"}</span>
          <span
            style={{
              fontFamily,
              fontSize: 14,
              fontWeight: 600,
              color: SITE.text,
            }}
          >
            Input Configuration
          </span>
        </div>

        {/* Tab selector (animated switch) */}
        <div
          style={{
            display: "flex",
            gap: 0,
            backgroundColor: SITE.borderLight,
            borderRadius: 8,
            padding: 3,
            opacity: headerOpacity,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "6px 0",
              textAlign: "center",
              borderRadius: 6,
              backgroundColor: showJsonTab ? "transparent" : SITE.cardSolid,
              boxShadow: showJsonTab ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 12,
                fontWeight: 500,
                color: showJsonTab ? SITE.muted : SITE.text,
              }}
            >
              Sample Curves
            </span>
          </div>
          <div
            style={{
              flex: 1,
              padding: "6px 0",
              textAlign: "center",
              borderRadius: 6,
              backgroundColor: showJsonTab ? SITE.cardSolid : "transparent",
              boxShadow: showJsonTab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 12,
                fontWeight: 500,
                color: showJsonTab ? SITE.text : SITE.muted,
              }}
            >
              JSON Input
            </span>
          </div>
        </div>

        {/* === SAMPLE TAB CONTENT === */}
        {!showJsonTab && (
          <>
            {/* Sample curve list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SAMPLES.map((sample, i) => {
                const appear = sampleAppear(i);
                const isSelected = i === 1 && selectionProgress > 0;
                const selectedBg = interpolate(
                  selectionProgress,
                  [0, 1],
                  [0, 1],
                );

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? SITE.primary + "40" : SITE.border}`,
                      backgroundColor: isSelected
                        ? `rgba(59, 130, 246, ${0.06 * selectedBg})`
                        : "transparent",
                      opacity: interpolate(appear, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(appear, [0, 1], [8, 0])}px)`,
                      cursor: "default",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{sample.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily,
                          fontSize: 12,
                          fontWeight: 500,
                          color: isSelected ? SITE.primary : SITE.text,
                        }}
                      >
                        {sample.name}
                      </div>
                      <div
                        style={{
                          fontFamily: monoFontFamily,
                          fontSize: 10,
                          color: SITE.muted,
                        }}
                      >
                        {sample.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        style={{
                          opacity: selectionProgress,
                          transform: `scale(${selectionProgress})`,
                        }}
                      >
                        <circle cx="8" cy="8" r="7" fill={SITE.primary} />
                        <path
                          d="M 4.5 8 L 7 10.5 L 11.5 5.5"
                          fill="none"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Data loaded indicator */}
            {selectionProgress > 0.5 && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: SITE.successLight,
                  border: `1px solid ${SITE.success}30`,
                  opacity: interpolate(dataLoadedProgress, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(dataLoadedProgress, [0, 1], [0.95, 1])})`,
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontSize: 11,
                    color: SITE.success,
                    fontWeight: 500,
                  }}
                >
                  {"✓"} Data Loaded — 100 frequency points
                </span>
              </div>
            )}
          </>
        )}

        {/* === JSON TAB CONTENT === */}
        {showJsonTab && (
          <>
            {/* JSON textarea mockup */}
            <div
              style={{
                backgroundColor: SITE.cardSolid,
                borderRadius: 8,
                border: `1px solid ${SITE.border}`,
                padding: "10px 12px",
                minHeight: 170,
                opacity: interpolate(jsonContentAppear, [0, 1], [0, 1]),
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {JSON_LINES.map((line, i) => {
                  const lineP = jsonLineAppear(i);
                  return (
                    <div
                      key={i}
                      style={{
                        opacity: interpolate(lineP, [0, 1], [0, 1]),
                        transform: `translateX(${interpolate(lineP, [0, 1], [8, 0])}px)`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: monoFontFamily,
                          fontSize: 10,
                          color: SITE.textSecondary,
                          lineHeight: "17px",
                        }}
                      >
                        {line}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Paste button hint */}
            <div
              style={{
                display: "flex",
                gap: 8,
                opacity: interpolate(jsonContentAppear, [0, 1], [0, 1]),
              }}
            >
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: `1px solid ${SITE.border}`,
                  backgroundColor: SITE.cardSolid,
                }}
              >
                <span style={{ fontFamily: monoFontFamily, fontSize: 10, color: SITE.muted }}>
                  Paste JSON
                </span>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: `1px solid ${SITE.border}`,
                  backgroundColor: SITE.cardSolid,
                }}
              >
                <span style={{ fontFamily: monoFontFamily, fontSize: 10, color: SITE.muted }}>
                  Load File
                </span>
              </div>
            </div>

            {/* JSON data loaded */}
            {jsonLoadedAppear > 0.1 && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: SITE.successLight,
                  border: `1px solid ${SITE.success}30`,
                  opacity: interpolate(jsonLoadedAppear, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(jsonLoadedAppear, [0, 1], [0.95, 1])})`,
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontSize: 11,
                    color: SITE.success,
                    fontWeight: 500,
                  }}
                >
                  {"✓"} JSON Parsed — 9 frequency points
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Parameters Card */}
      <div
        style={{
          backgroundColor: SITE.card,
          borderRadius: 12,
          border: `1px solid ${SITE.border}`,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          backdropFilter: "blur(12px)",
          opacity: paramsOpacity,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>{"⚙️"}</span>
          <span
            style={{
              fontFamily,
              fontSize: 14,
              fontWeight: 600,
              color: SITE.text,
            }}
          >
            Model Parameters
          </span>
        </div>

        {/* Candidates slider */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontFamily, fontSize: 12, color: SITE.textSecondary }}>
              Candidates (Best-of-N)
            </span>
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 12,
                fontWeight: 600,
                color: SITE.primary,
                backgroundColor: SITE.primaryLight,
                padding: "1px 8px",
                borderRadius: 4,
              }}
            >
              {Math.round(candidatesValue)}
            </span>
          </div>
          <div
            style={{
              height: 6,
              backgroundColor: SITE.borderLight,
              borderRadius: 3,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${candidatesThumb}%`,
                height: "100%",
                backgroundColor: SITE.primary,
                borderRadius: 3,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -4,
                left: `${candidatesThumb}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: SITE.cardSolid,
                border: `2px solid ${SITE.primary}`,
                transform: "translateX(-50%)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        </div>

        {/* Temperature slider */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontFamily, fontSize: 12, color: SITE.textSecondary }}>
              Temperature ({"τ"})
            </span>
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 12,
                fontWeight: 600,
                color: SITE.accent,
                backgroundColor: SITE.accentLight,
                padding: "1px 8px",
                borderRadius: 4,
              }}
            >
              {tempValue.toFixed(1)}
            </span>
          </div>
          <div
            style={{
              height: 6,
              backgroundColor: SITE.borderLight,
              borderRadius: 3,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${tempThumb}%`,
                height: "100%",
                backgroundColor: SITE.accent,
                borderRadius: 3,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -4,
                left: `${tempThumb}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: SITE.cardSolid,
                border: `2px solid ${SITE.accent}`,
                transform: "translateX(-50%)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div
        style={{
          opacity: buttonOpacity,
          transform: `scale(${combinedScale})`,
        }}
      >
        <div
          style={{
            padding: "14px 0",
            borderRadius: 12,
            backgroundColor: anyLoading ? SITE.muted : SITE.primary,
            textAlign: "center",
            boxShadow: combinedGlow > 0
              ? `0 0 ${20 + combinedGlow * 20}px ${SITE.primary}${Math.round(combinedGlow * 60).toString(16).padStart(2, "0")}`
              : "0 2px 8px rgba(59, 130, 246, 0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {anyLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: combinedLoadingOpacity,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                style={{ transform: `rotate(${combinedSpinner}deg)` }}
              >
                <circle
                  cx="9"
                  cy="9"
                  r="7"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                <path
                  d="M 9 2 A 7 7 0 0 1 16 9"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontFamily,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                Synthesizing... 50 candidates
              </span>
            </div>
          ) : (
            <span
              style={{
                fontFamily,
                fontSize: 14,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              Generate Circuit
            </span>
          )}
        </div>
      </div>
    </>
  );
};
