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
import { SceneTitle } from "../components/SceneTitle";
import { SPRING_SNAPPY, SPRING_SMOOTH } from "../lib/animations";

// Error bar data
const ERROR_DATA = [
  { label: "Self-loops", value: 42, color: COLORS.red },
  { label: "Duplicates", value: 31, color: COLORS.orange },
  { label: "Dead-ends", value: 9, color: COLORS.orangeLight },
  { label: "Déconnectés", value: 9, color: COLORS.gray400 },
];

export const SceneChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main stat
  const statProgress = spring({
    frame,
    fps,
    delay: 30,
    config: SPRING_SNAPPY,
  });

  // Error bars
  const barsProgress = (i: number) =>
    spring({
      frame,
      fps,
      delay: 80 + i * 15,
      config: SPRING_SMOOTH,
    });

  // Problem explanation
  const explainProgress = spring({
    frame,
    fps,
    delay: 180,
    config: SPRING_SMOOTH,
  });

  // Self-loop illustration
  const loopProgress = spring({
    frame,
    fps,
    delay: 220,
    config: SPRING_SMOOTH,
  });

  return (
    <AbsoluteFill>
      <GridBackground />
      <SceneTitle number={5} title="Le Défi" />

      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 80,
          padding: "0 100px",
        }}
      >
        {/* Left: Big invalid stat */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: interpolate(statProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(statProgress, [0, 1], [0.8, 1])})`,
          }}
        >
          <div
            style={{
              backgroundColor: `${COLORS.red}12`,
              borderRadius: 24,
              padding: "40px 60px",
              border: `1px solid ${COLORS.red}30`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              boxShadow: `0 0 60px ${COLORS.red}15`,
            }}
          >
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 96,
                fontWeight: 800,
                color: COLORS.red,
                lineHeight: 1,
              }}
            >
              91%
            </span>
            <span
              style={{
                fontFamily,
                fontSize: 22,
                color: COLORS.gray300,
                fontWeight: 500,
              }}
            >
              de circuits invalides
            </span>
            <span
              style={{
                fontFamily,
                fontSize: 16,
                color: COLORS.gray500,
              }}
            >
              Architecture V1 (heads indépendantes)
            </span>
          </div>
        </div>

        {/* Right: Error breakdown */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: 500,
            paddingTop: 20,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 20,
              color: COLORS.gray400,
              fontWeight: 500,
              opacity: interpolate(
                spring({ frame, fps, delay: 60, config: SPRING_SMOOTH }),
                [0, 1],
                [0, 1],
              ),
            }}
          >
            Répartition des erreurs :
          </span>

          {ERROR_DATA.map((item, i) => {
            const p = barsProgress(i);
            const barWidth = interpolate(p, [0, 1], [0, item.value * 4.5]);

            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontSize: 16,
                    color: COLORS.gray300,
                    width: 120,
                    textAlign: "right",
                    opacity: interpolate(p, [0, 0.3], [0, 1], {
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  {item.label}
                </span>

                <div
                  style={{
                    flex: 1,
                    height: 32,
                    backgroundColor: `${COLORS.gray800}`,
                    borderRadius: 8,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: barWidth,
                      height: "100%",
                      backgroundColor: `${item.color}40`,
                      borderRadius: 8,
                      border: `1px solid ${item.color}60`,
                    }}
                  />
                </div>

                <span
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 18,
                    fontWeight: 600,
                    color: item.color,
                    width: 50,
                    opacity: interpolate(p, [0.5, 1], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  {item.value}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Self-loop illustration */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          alignItems: "center",
          gap: 60,
          opacity: interpolate(explainProgress, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 16,
              color: COLORS.gray500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Exemple : Self-loop
          </span>

          <div
            style={{
              opacity: interpolate(loopProgress, [0, 1], [0, 1]),
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <svg width="140" height="60">
              <circle cx="40" cy="30" r="8" fill={COLORS.gray400} />
              <text
                x="40"
                y="55"
                textAnchor="middle"
                fill={COLORS.gray500}
                fontSize="12"
                fontFamily={monoFontFamily}
              >
                n2
              </text>
              {/* Self-loop arrow */}
              <path
                d="M 48 24 C 80 -10 100 -10 100 24 C 100 50 80 50 48 36"
                fill="none"
                stroke={COLORS.red}
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <text
                x="90"
                y="10"
                fill={COLORS.red}
                fontSize="14"
                fontFamily={monoFontFamily}
                fontWeight="600"
              >
                R(2,2)
              </text>
            </svg>

            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 18,
                color: COLORS.red,
              }}
            >
              node_a = node_b
            </span>
          </div>
        </div>

        <div
          style={{
            width: 1,
            height: 50,
            backgroundColor: COLORS.gray700,
          }}
        />

        <span
          style={{
            fontFamily,
            fontSize: 18,
            color: COLORS.gray400,
            maxWidth: 400,
          }}
        >
          Les heads prédisent <span style={{ color: COLORS.red }}>indépendamment</span>
          {" "}→ aucune contrainte structurelle
        </span>
      </div>
    </AbsoluteFill>
  );
};
