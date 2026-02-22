import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { GridBackground } from "../components/GridBackground";
import { SPRING_SNAPPY, SPRING_SMOOTH } from "../lib/animations";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Web app mockup
  const mockupProgress = spring({
    frame,
    fps,
    delay: 15,
    config: SPRING_SMOOTH,
  });

  // Title
  const titleProgress = spring({
    frame,
    fps,
    delay: 60,
    config: SPRING_SNAPPY,
  });

  // Tech stack
  const techProgress = spring({
    frame,
    fps,
    delay: 120,
    config: SPRING_SMOOTH,
  });

  // Credits
  const creditsProgress = spring({
    frame,
    fps,
    delay: 200,
    config: SPRING_SMOOTH,
  });

  return (
    <AbsoluteFill>
      <GridBackground />

      {/* Web app mockup */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: `translate(-50%, 0) scale(${interpolate(mockupProgress, [0, 1], [0.9, 1])})`,
          opacity: interpolate(mockupProgress, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            width: 900,
            height: 480,
            backgroundColor: COLORS.bgCard,
            borderRadius: 16,
            border: `1px solid ${COLORS.gray700}`,
            overflow: "hidden",
            boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
          }}
        >
          {/* Browser bar */}
          <div
            style={{
              height: 40,
              backgroundColor: "#0d0d24",
              borderBottom: `1px solid ${COLORS.gray800}`,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: COLORS.red,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: COLORS.orange,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: COLORS.green,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                flex: 1,
                height: 24,
                backgroundColor: COLORS.bgCard,
                borderRadius: 6,
                marginLeft: 20,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
              }}
            >
              <span
                style={{
                  fontFamily: monoFontFamily,
                  fontSize: 12,
                  color: COLORS.gray500,
                }}
              >
                circuit-synthesis.ai
              </span>
            </div>
          </div>

          {/* App content */}
          <div
            style={{
              display: "flex",
              height: 440,
            }}
          >
            {/* Left: Input */}
            <div
              style={{
                flex: 1,
                padding: 28,
                borderRight: `1px solid ${COLORS.gray800}`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: 14,
                  color: COLORS.gray400,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Courbe d'impédance
              </span>

              {/* Fake chart */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: `${COLORS.bg}80`,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.gray800}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="350" height="200" viewBox="0 0 350 200">
                  <path
                    d="M 30 150 Q 80 150 100 100 Q 120 50 160 80 Q 200 110 250 60 L 320 40"
                    fill="none"
                    stroke={COLORS.blue}
                    strokeWidth="2.5"
                    opacity="0.8"
                  />
                  <path
                    d="M 30 120 Q 80 130 120 140 Q 160 150 200 100 Q 240 50 320 80"
                    fill="none"
                    stroke={COLORS.orange}
                    strokeWidth="2"
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Fake button */}
              <div
                style={{
                  padding: "12px 20px",
                  backgroundColor: COLORS.blue,
                  borderRadius: 10,
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.white,
                  }}
                >
                  Analyser
                </span>
              </div>
            </div>

            {/* Right: Output */}
            <div
              style={{
                flex: 1,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: 14,
                  color: COLORS.gray400,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Circuit prédit
              </span>

              {/* Fake circuit output */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: `${COLORS.bg}80`,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.gray800}`,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  justifyContent: "center",
                }}
              >
                {/* Circuit diagram placeholder */}
                <svg width="350" height="80" viewBox="0 0 350 80">
                  <line
                    x1="20"
                    y1="40"
                    x2="70"
                    y2="40"
                    stroke={COLORS.gray500}
                    strokeWidth="2"
                  />
                  <rect
                    x="70"
                    y="28"
                    width="50"
                    height="24"
                    fill="none"
                    stroke={COLORS.blue}
                    strokeWidth="2"
                    rx="3"
                  />
                  <line
                    x1="120"
                    y1="40"
                    x2="160"
                    y2="40"
                    stroke={COLORS.gray500}
                    strokeWidth="2"
                  />
                  {[0, 1, 2, 3].map((i) => (
                    <path
                      key={i}
                      d={`M ${160 + i * 14} 40 A 7 7 0 0 1 ${160 + (i + 1) * 14} 40`}
                      fill="none"
                      stroke={COLORS.green}
                      strokeWidth="2"
                    />
                  ))}
                  <line
                    x1="216"
                    y1="40"
                    x2="260"
                    y2="40"
                    stroke={COLORS.gray500}
                    strokeWidth="2"
                  />
                  <line
                    x1="260"
                    y1="24"
                    x2="260"
                    y2="56"
                    stroke={COLORS.orange}
                    strokeWidth="3"
                  />
                  <line
                    x1="270"
                    y1="24"
                    x2="270"
                    y2="56"
                    stroke={COLORS.orange}
                    strokeWidth="3"
                  />
                  <line
                    x1="270"
                    y1="40"
                    x2="330"
                    y2="40"
                    stroke={COLORS.gray500}
                    strokeWidth="2"
                  />
                </svg>

                {/* Component values */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  {[
                    { label: "R", value: "47Ω", color: COLORS.blue },
                    { label: "L", value: "2.2mH", color: COLORS.green },
                    { label: "C", value: "470nF", color: COLORS.orange },
                  ].map((c) => (
                    <div
                      key={c.label}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        backgroundColor: `${c.color}10`,
                        border: `1px solid ${c.color}30`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: monoFontFamily,
                          fontSize: 13,
                          color: c.color,
                        }}
                      >
                        {c.label} = {c.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Validity badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      padding: "4px 14px",
                      borderRadius: 100,
                      backgroundColor: `${COLORS.green}15`,
                      border: `1px solid ${COLORS.green}40`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: monoFontFamily,
                        fontSize: 12,
                        color: COLORS.green,
                      }}
                    >
                      Circuit valide
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title below mockup */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: "50%",
          transform: "translate(-50%, 0)",
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <h2
          style={{
            fontFamily,
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.white,
            margin: 0,
          }}
        >
          Circuit Synthesis
          <span style={{ color: COLORS.blue }}> AI</span>
        </h2>
      </div>

      {/* Tech stack */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          gap: 24,
          opacity: interpolate(techProgress, [0, 1], [0, 1]),
        }}
      >
        {["PyTorch", "FastAPI", "Next.js", "React"].map((tech, i) => {
          const tP = spring({
            frame,
            fps,
            delay: 130 + i * 10,
            config: SPRING_SMOOTH,
          });
          return (
            <div
              key={tech}
              style={{
                padding: "6px 18px",
                borderRadius: 100,
                border: `1px solid ${COLORS.gray600}`,
                backgroundColor: `${COLORS.bgCard}60`,
                opacity: interpolate(tP, [0, 1], [0, 1]),
              }}
            >
              <span
                style={{
                  fontFamily: monoFontFamily,
                  fontSize: 14,
                  color: COLORS.gray300,
                }}
              >
                {tech}
              </span>
            </div>
          );
        })}
      </div>

      {/* Credits */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translate(-50%, 0)",
          opacity: interpolate(creditsProgress, [0, 1], [0, 0.6]),
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 14,
            color: COLORS.gray500,
          }}
        >
          PRI - Bilel Azzouzi
        </span>
      </div>
    </AbsoluteFill>
  );
};
