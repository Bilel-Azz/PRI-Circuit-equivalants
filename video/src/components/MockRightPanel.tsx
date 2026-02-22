import {
  interpolate,
  Easing,
  spring,
  useVideoConfig,
} from "remotion";
import { SITE } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { SPRING_SNAPPY, SPRING_SMOOTH } from "../lib/animations";
import { MockChart } from "./MockChart";
import { MockCircuit } from "./MockCircuit";

type Props = {
  siteFrame: number;
};

const CANDIDATES = [
  { components: ["R:100Ω", "L:1mH", "C:220nF"], error: "0.089" },
  { components: ["R:68Ω", "L:3.3mH", "C:680nF"], error: "0.134" },
  { components: ["R:150Ω", "L:1.5mH", "C:330nF"], error: "0.156" },
  { components: ["R:33Ω", "C:1μF", "L:4.7mH"], error: "0.201" },
  { components: ["R:220Ω", "L:2.2mH"], error: "0.287" },
];

export const MockRightPanel: React.FC<Props> = ({ siteFrame }) => {
  const { fps } = useVideoConfig();

  // Results appear after loading (siteFrame 500)
  const resultsAppear = interpolate(siteFrame, [500, 520], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Before results: empty state or loading
  const isLoading = siteFrame > 355 && siteFrame < 500;
  const showResults = siteFrame >= 500;

  // Loading animation
  const loadingOpacity = interpolate(siteFrame, [355, 365, 480, 500], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spinAngle = siteFrame > 355 ? (siteFrame - 355) * 8 : 0;

  // Metric counters (start at siteFrame 525)
  const metricDuration = 25;
  const magError = interpolate(siteFrame, [525, 525 + metricDuration], [0, 0.023], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const phaseError = interpolate(siteFrame, [532, 532 + metricDuration], [0, 2.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const candidatesCount = interpolate(siteFrame, [540, 540 + metricDuration], [0, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Metric cards spring-in
  const metricCardAppear = (delay: number) =>
    spring({ frame: siteFrame, fps, delay, config: SPRING_SNAPPY });
  const mc1 = metricCardAppear(505);
  const mc2 = metricCardAppear(512);
  const mc3 = metricCardAppear(520);

  // Candidates appear
  const candidatesAppear = interpolate(siteFrame, [1270, 1295], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Empty state (before any interaction)
  const showEmpty = siteFrame < 355;

  return (
    <>
      {/* Empty state */}
      {showEmpty && (
        <div
          style={{
            flex: 1,
            backgroundColor: SITE.card,
            borderRadius: 12,
            border: `1px solid ${SITE.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            backdropFilter: "blur(12px)",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" opacity={0.3}>
            <rect x="8" y="8" width="32" height="32" rx="6" fill="none" stroke={SITE.muted} strokeWidth="2" />
            <circle cx="24" cy="24" r="8" fill="none" stroke={SITE.muted} strokeWidth="1.5" />
            <line x1="24" y1="16" x2="24" y2="20" stroke={SITE.muted} strokeWidth="1.5" />
            <line x1="24" y1="28" x2="24" y2="32" stroke={SITE.muted} strokeWidth="1.5" />
          </svg>
          <span style={{ fontFamily, fontSize: 14, fontWeight: 500, color: SITE.text }}>
            Ready to Generate
          </span>
          <span style={{ fontFamily, fontSize: 12, color: SITE.muted }}>
            Select an input and click Generate
          </span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            flex: 1,
            backgroundColor: SITE.card,
            borderRadius: 12,
            border: `1px solid ${SITE.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            backdropFilter: "blur(12px)",
            opacity: loadingOpacity,
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            style={{ transform: `rotate(${spinAngle}deg)` }}
          >
            <circle cx="18" cy="18" r="14" fill="none" stroke={SITE.border} strokeWidth="3" />
            <path d="M 18 4 A 14 14 0 0 1 32 18" fill="none" stroke={SITE.primary} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily, fontSize: 14, fontWeight: 500, color: SITE.text }}>
            Synthesizing Circuit...
          </span>
          <span style={{ fontFamily: monoFontFamily, fontSize: 12, color: SITE.muted }}>
            Evaluating 50 candidates
          </span>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <>
          {/* Metrics row */}
          <div
            style={{
              display: "flex",
              gap: 12,
              opacity: resultsAppear,
            }}
          >
            {[
              { label: "Magnitude Error", value: magError.toFixed(3), color: SITE.primary, appear: mc1 },
              { label: "Phase Error", value: phaseError.toFixed(1) + "°", color: SITE.accent, appear: mc2 },
              { label: "Candidates", value: Math.round(candidatesCount).toString(), color: SITE.text, appear: mc3 },
            ].map((metric, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: SITE.card,
                  borderRadius: 10,
                  border: `1px solid ${SITE.border}`,
                  padding: "12px 14px",
                  backdropFilter: "blur(12px)",
                  opacity: interpolate(metric.appear, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(metric.appear, [0, 1], [0.9, 1])}) translateY(${interpolate(metric.appear, [0, 1], [8, 0])}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily,
                    fontSize: 10,
                    color: SITE.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 22,
                    fontWeight: 700,
                    color: metric.color,
                  }}
                >
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div
            style={{
              backgroundColor: SITE.card,
              borderRadius: 12,
              border: `1px solid ${SITE.border}`,
              padding: "14px 16px",
              backdropFilter: "blur(12px)",
            }}
          >
            <MockChart siteFrame={siteFrame} width={880} height={180} />
          </div>

          {/* Circuit */}
          <div
            style={{
              backgroundColor: SITE.card,
              borderRadius: 12,
              border: `1px solid ${SITE.border}`,
              padding: "14px 16px",
              backdropFilter: "blur(12px)",
            }}
          >
            <MockCircuit siteFrame={siteFrame} width={880} height={220} />
          </div>

          {/* Candidates */}
          <div
            style={{
              backgroundColor: SITE.card,
              borderRadius: 12,
              border: `1px solid ${SITE.border}`,
              padding: "14px 16px",
              backdropFilter: "blur(12px)",
              opacity: candidatesAppear,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 13,
                fontWeight: 600,
                color: SITE.text,
                display: "block",
                marginBottom: 10,
              }}
            >
              Alternative Candidates
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CANDIDATES.map((cand, i) => {
                const candDelay = 1275 + i * 5;
                const candAppear = interpolate(
                  siteFrame,
                  [candDelay, candDelay + 20],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${SITE.border}`,
                      opacity: candAppear,
                      transform: `translateY(${interpolate(candAppear, [0, 1], [6, 0])}px)`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span
                        style={{
                          fontFamily: monoFontFamily,
                          fontSize: 10,
                          color: SITE.muted,
                          width: 16,
                        }}
                      >
                        #{i + 2}
                      </span>
                      {cand.components.map((comp, j) => {
                        const type = comp.split(":")[0];
                        const color =
                          type === "R"
                            ? SITE.compR
                            : type === "L"
                              ? SITE.compL
                              : SITE.compC;
                        return (
                          <div
                            key={j}
                            style={{
                              padding: "2px 7px",
                              borderRadius: 4,
                              backgroundColor: `${color}12`,
                              border: `1px solid ${color}25`,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: monoFontFamily,
                                fontSize: 9,
                                color,
                                fontWeight: 500,
                              }}
                            >
                              {comp}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <span
                      style={{
                        fontFamily: monoFontFamily,
                        fontSize: 11,
                        color: SITE.muted,
                      }}
                    >
                      err: {cand.error}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
