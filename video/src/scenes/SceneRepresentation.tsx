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

// The vector table data
const VECTOR_DATA = [
  { type: "START", typeId: "4", nodeA: "0", nodeB: "0", value: "0" },
  { type: "R", typeId: "1", nodeA: "1", nodeB: "2", value: "100" },
  { type: "L", typeId: "2", nodeA: "2", nodeB: "3", value: "1e-3" },
  { type: "C", typeId: "3", nodeA: "3", nodeB: "0", value: "1e-6" },
  { type: "END", typeId: "5", nodeA: "0", nodeB: "0", value: "0" },
];

export const SceneRepresentation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Circuit diagram appears first
  const circuitProgress = spring({
    frame,
    fps,
    delay: 20,
    config: SPRING_SMOOTH,
  });

  // Arrow from circuit to vector
  const arrowProgress = spring({
    frame,
    fps,
    delay: 90,
    config: SPRING_SMOOTH,
  });

  // Vector table appears
  const tableProgress = spring({
    frame,
    fps,
    delay: 110,
    config: SPRING_SMOOTH,
  });

  // Bottom explanation
  const explainProgress = spring({
    frame,
    fps,
    delay: 180,
    config: SPRING_SMOOTH,
  });

  return (
    <AbsoluteFill>
      <GridBackground />
      <SceneTitle number={3} title="Représentation" />

      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
        }}
      >
        {/* Left: Circuit diagram */}
        <div
          style={{
            opacity: interpolate(circuitProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(circuitProgress, [0, 1], [0.9, 1])})`,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: 20,
              padding: "40px 36px",
              border: `1px solid ${COLORS.gray700}`,
            }}
          >
            <svg width="420" height="250" viewBox="0 0 420 250">
              {/* Node labels */}
              <text
                x="30"
                y="90"
                fill={COLORS.gray300}
                fontSize="18"
                fontFamily={fontFamily}
                fontWeight="600"
              >
                IN
              </text>
              <text
                x="375"
                y="90"
                fill={COLORS.gray300}
                fontSize="18"
                fontFamily={fontFamily}
                fontWeight="600"
              >
                GND
              </text>

              {/* Node circles */}
              <circle cx="65" cy="85" r="6" fill={COLORS.gray400} />
              <circle cx="160" cy="85" r="6" fill={COLORS.gray400} />
              <circle cx="260" cy="85" r="6" fill={COLORS.gray400} />
              <circle cx="360" cy="85" r="6" fill={COLORS.gray400} />

              {/* Node numbers */}
              <text
                x="65"
                y="120"
                textAnchor="middle"
                fill={COLORS.gray500}
                fontSize="14"
                fontFamily={monoFontFamily}
              >
                n1
              </text>
              <text
                x="160"
                y="120"
                textAnchor="middle"
                fill={COLORS.gray500}
                fontSize="14"
                fontFamily={monoFontFamily}
              >
                n2
              </text>
              <text
                x="260"
                y="120"
                textAnchor="middle"
                fill={COLORS.gray500}
                fontSize="14"
                fontFamily={monoFontFamily}
              >
                n3
              </text>
              <text
                x="360"
                y="120"
                textAnchor="middle"
                fill={COLORS.gray500}
                fontSize="14"
                fontFamily={monoFontFamily}
              >
                n0
              </text>

              {/* R: between n1 and n2 */}
              <line
                x1="71"
                y1="85"
                x2="90"
                y2="85"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />
              <rect
                x="90"
                y="73"
                width="40"
                height="24"
                fill="none"
                stroke={COLORS.blue}
                strokeWidth="2.5"
                rx="3"
              />
              <text
                x="110"
                y="65"
                textAnchor="middle"
                fill={COLORS.blue}
                fontSize="16"
                fontFamily={monoFontFamily}
                fontWeight="700"
              >
                R
              </text>
              <line
                x1="130"
                y1="85"
                x2="154"
                y2="85"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />

              {/* L: between n2 and n3 */}
              <line
                x1="166"
                y1="85"
                x2="185"
                y2="85"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M ${185 + i * 14} 85 A 7 7 0 0 1 ${185 + (i + 1) * 14} 85`}
                  fill="none"
                  stroke={COLORS.green}
                  strokeWidth="2.5"
                />
              ))}
              <text
                x="213"
                y="70"
                textAnchor="middle"
                fill={COLORS.green}
                fontSize="16"
                fontFamily={monoFontFamily}
                fontWeight="700"
              >
                L
              </text>
              <line
                x1="241"
                y1="85"
                x2="254"
                y2="85"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />

              {/* C: between n3 and n0 */}
              <line
                x1="266"
                y1="85"
                x2="305"
                y2="85"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />
              <line
                x1="305"
                y1="68"
                x2="305"
                y2="102"
                stroke={COLORS.orange}
                strokeWidth="3"
              />
              <line
                x1="315"
                y1="68"
                x2="315"
                y2="102"
                stroke={COLORS.orange}
                strokeWidth="3"
              />
              <text
                x="310"
                y="58"
                textAnchor="middle"
                fill={COLORS.orange}
                fontSize="16"
                fontFamily={monoFontFamily}
                fontWeight="700"
              >
                C
              </text>
              <line
                x1="315"
                y1="85"
                x2="354"
                y2="85"
                stroke={COLORS.gray500}
                strokeWidth="2"
              />

              {/* Values under components */}
              <text
                x="110"
                y="155"
                textAnchor="middle"
                fill={COLORS.blue}
                fontSize="13"
                fontFamily={monoFontFamily}
                opacity="0.7"
              >
                100Ω
              </text>
              <text
                x="213"
                y="155"
                textAnchor="middle"
                fill={COLORS.green}
                fontSize="13"
                fontFamily={monoFontFamily}
                opacity="0.7"
              >
                1mH
              </text>
              <text
                x="310"
                y="155"
                textAnchor="middle"
                fill={COLORS.orange}
                fontSize="13"
                fontFamily={monoFontFamily}
                opacity="0.7"
              >
                1μF
              </text>
            </svg>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ opacity: arrowProgress }}>
          <svg width="80" height="60">
            <defs>
              <linearGradient id="repArrow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={COLORS.gray500} stopOpacity="0.4" />
                <stop
                  offset="100%"
                  stopColor={COLORS.blue}
                  stopOpacity="0.8"
                />
              </linearGradient>
            </defs>
            <line
              x1="5"
              y1="30"
              x2="55"
              y2="30"
              stroke="url(#repArrow)"
              strokeWidth="2.5"
            />
            <polygon points="52,22 68,30 52,38" fill={COLORS.blue} opacity="0.7" />
          </svg>
        </div>

        {/* Right: Vector table */}
        <div
          style={{
            opacity: interpolate(tableProgress, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(tableProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: 20,
              padding: "28px 28px",
              border: `1px solid ${COLORS.blue}25`,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                gap: 0,
                marginBottom: 12,
                borderBottom: `1px solid ${COLORS.gray700}`,
                paddingBottom: 12,
              }}
            >
              {["Type", "Node A", "Node B", "Value"].map((h) => (
                <div
                  key={h}
                  style={{
                    width: 90,
                    fontFamily: monoFontFamily,
                    fontSize: 13,
                    color: COLORS.gray500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textAlign: "center",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {VECTOR_DATA.map((row, i) => {
              const rowDelay = 120 + i * 12;
              const rowP = spring({
                frame,
                fps,
                delay: rowDelay,
                config: SPRING_SMOOTH,
              });
              const rowOpacity = interpolate(rowP, [0, 1], [0, 1]);

              const typeColor =
                row.type === "R"
                  ? COLORS.blue
                  : row.type === "L"
                    ? COLORS.green
                    : row.type === "C"
                      ? COLORS.orange
                      : COLORS.gray400;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 0,
                    padding: "8px 0",
                    opacity: rowOpacity,
                    borderBottom:
                      i < VECTOR_DATA.length - 1
                        ? `1px solid ${COLORS.gray800}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      fontFamily: monoFontFamily,
                      fontSize: 16,
                      color: typeColor,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {row.type}
                  </div>
                  <div
                    style={{
                      width: 90,
                      fontFamily: monoFontFamily,
                      fontSize: 16,
                      color: COLORS.gray300,
                      textAlign: "center",
                    }}
                  >
                    {row.nodeA}
                  </div>
                  <div
                    style={{
                      width: 90,
                      fontFamily: monoFontFamily,
                      fontSize: 16,
                      color: COLORS.gray300,
                      textAlign: "center",
                    }}
                  >
                    {row.nodeB}
                  </div>
                  <div
                    style={{
                      width: 90,
                      fontFamily: monoFontFamily,
                      fontSize: 16,
                      color: COLORS.gray300,
                      textAlign: "center",
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom explanation */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          gap: 60,
          opacity: interpolate(explainProgress, [0, 1], [0, 1]),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: COLORS.green,
            }}
          />
          <span
            style={{ fontFamily, fontSize: 18, color: COLORS.gray300 }}
          >
            Un circuit = un graphe
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: COLORS.blue,
            }}
          />
          <span
            style={{ fontFamily, fontSize: 18, color: COLORS.gray300 }}
          >
            Encodé en séquence [Type, Node_A, Node_B, Value]
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
