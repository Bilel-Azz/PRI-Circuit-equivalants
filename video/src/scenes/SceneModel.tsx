import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { COLORS } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { GridBackground } from "../components/GridBackground";
import { SceneTitle } from "../components/SceneTitle";
import { SPRING_SMOOTH, SPRING_SNAPPY } from "../lib/animations";

// Architecture block component
const ArchBlock: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  sublabel?: string;
  color: string;
  delay: number;
}> = ({ x, y, width, height, label, sublabel, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, delay, config: SPRING_SNAPPY });
  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <g
      opacity={opacity}
      transform={`translate(${x + width / 2}, ${y + height / 2}) scale(${scale}) translate(${-(x + width / 2)}, ${-(y + height / 2)})`}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`${color}15`}
        stroke={`${color}50`}
        strokeWidth="2"
        rx="14"
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - (sublabel ? 6 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="20"
        fontFamily={fontFamily}
        fontWeight="700"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.gray500}
          fontSize="13"
          fontFamily={monoFontFamily}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
};

export const SceneModel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Data flow arrows
  const flow1 = interpolate(frame, [60, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const flow2 = interpolate(frame, [120, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const flow3 = interpolate(frame, [180, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const flow4 = interpolate(frame, [240, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Arrows paths
  const arrow1 = "M 380 400 L 480 400";
  const arrow2 = "M 720 400 L 820 400";
  const arrow3 = "M 1060 400 L 1160 400";
  const arrow4 = "M 1400 400 L 1500 400";

  const arrowEvolve1 = evolvePath(flow1, arrow1);
  const arrowEvolve2 = evolvePath(flow2, arrow2);
  const arrowEvolve3 = evolvePath(flow3, arrow3);
  const arrowEvolve4 = evolvePath(flow4, arrow4);

  // Bottom detail text
  const detailProgress = spring({
    frame,
    fps,
    delay: 300,
    config: SPRING_SMOOTH,
  });

  return (
    <AbsoluteFill>
      <GridBackground />
      <SceneTitle number={4} title="Le Modèle" />

      {/* Main architecture diagram */}
      <svg
        width="1920"
        height="700"
        viewBox="0 0 1920 700"
        style={{
          position: "absolute",
          top: 160,
          left: 0,
        }}
      >
        {/* Input block */}
        <ArchBlock
          x={100}
          y={310}
          width={280}
          height={180}
          label="Entrée"
          sublabel="Z(f) = (2, 100)"
          color={COLORS.gray300}
          delay={15}
        />

        {/* Small curve inside input block */}
        <g opacity={interpolate(
          spring({ frame, fps, delay: 30, config: SPRING_SMOOTH }),
          [0, 1],
          [0, 0.6],
        )}>
          <path
            d="M 150 430 Q 190 430 210 400 Q 230 370 260 400 Q 290 430 330 380"
            fill="none"
            stroke={COLORS.blue}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Arrow 1 */}
        <path
          d={arrow1}
          fill="none"
          stroke={COLORS.gray500}
          strokeWidth="2.5"
          strokeDasharray={arrowEvolve1.strokeDasharray}
          strokeDashoffset={arrowEvolve1.strokeDashoffset}
          markerEnd="url(#arrowHead)"
        />

        {/* CNN Encoder */}
        <ArchBlock
          x={480}
          y={310}
          width={240}
          height={180}
          label="CNN Encoder"
          sublabel="1D Convolutions"
          color={COLORS.blue}
          delay={60}
        />

        {/* Conv layers visualization */}
        <g opacity={interpolate(
          spring({ frame, fps, delay: 80, config: SPRING_SMOOTH }),
          [0, 1],
          [0, 0.5],
        )}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={510 + i * 30}
              y={420 + i * 8}
              width={60 - i * 15}
              height={30 - i * 6}
              fill={`${COLORS.blue}${30 - i * 8}`}
              stroke={COLORS.blue}
              strokeWidth="1"
              rx="4"
            />
          ))}
        </g>

        {/* Arrow 2 */}
        <path
          d={arrow2}
          fill="none"
          stroke={COLORS.gray500}
          strokeWidth="2.5"
          strokeDasharray={arrowEvolve2.strokeDasharray}
          strokeDashoffset={arrowEvolve2.strokeDashoffset}
        />

        {/* Latent Space */}
        <ArchBlock
          x={820}
          y={330}
          width={240}
          height={140}
          label="Espace Latent"
          sublabel="d = 512"
          color={COLORS.purple}
          delay={120}
        />

        {/* Arrow 3 */}
        <path
          d={arrow3}
          fill="none"
          stroke={COLORS.gray500}
          strokeWidth="2.5"
          strokeDasharray={arrowEvolve3.strokeDasharray}
          strokeDashoffset={arrowEvolve3.strokeDashoffset}
        />

        {/* Transformer Decoder */}
        <ArchBlock
          x={1160}
          y={310}
          width={240}
          height={180}
          label="Transformer"
          sublabel="Decoder autoregressif"
          color={COLORS.green}
          delay={180}
        />

        {/* Attention heads visualization */}
        <g opacity={interpolate(
          spring({ frame, fps, delay: 200, config: SPRING_SMOOTH }),
          [0, 1],
          [0, 0.5],
        )}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <line
                x1={1200}
                y1={430 + i * 12}
                x2={1360}
                y2={430 + i * 12}
                stroke={COLORS.green}
                strokeWidth="1"
                opacity={0.3}
              />
              {[0, 1, 2, 3].map((j) => (
                <circle
                  key={j}
                  cx={1220 + j * 40}
                  cy={430 + i * 12}
                  r="3"
                  fill={COLORS.green}
                  opacity={0.5}
                />
              ))}
            </g>
          ))}
        </g>

        {/* Arrow 4 */}
        <path
          d={arrow4}
          fill="none"
          stroke={COLORS.gray500}
          strokeWidth="2.5"
          strokeDasharray={arrowEvolve4.strokeDasharray}
          strokeDashoffset={arrowEvolve4.strokeDashoffset}
        />

        {/* Output block */}
        <ArchBlock
          x={1500}
          y={310}
          width={280}
          height={180}
          label="Sortie"
          sublabel="[Type, A, B, Val] × 12"
          color={COLORS.orange}
          delay={240}
        />

        {/* Arrow heads definition */}
        <defs>
          <marker
            id="arrowHead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.gray500} />
          </marker>
        </defs>
      </svg>

      {/* Bottom detail cards */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          opacity: interpolate(detailProgress, [0, 1], [0, 1]),
        }}
      >
        {[
          {
            label: "CNN 1D",
            desc: "Features locales des courbes",
            color: COLORS.blue,
          },
          {
            label: "Attention",
            desc: "Relations entre composants",
            color: COLORS.green,
          },
          {
            label: "Autorégressif",
            desc: "Génère un composant à la fois",
            color: COLORS.orange,
          },
        ].map((item, i) => {
          const cardDelay = 310 + i * 15;
          const cardP = spring({
            frame,
            fps,
            delay: cardDelay,
            config: SPRING_SMOOTH,
          });
          return (
            <div
              key={item.label}
              style={{
                padding: "16px 28px",
                backgroundColor: COLORS.bgCard,
                borderRadius: 14,
                border: `1px solid ${item.color}25`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: interpolate(cardP, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(cardP, [0, 1], [15, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                }}
              />
              <div>
                <span
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 15,
                    fontWeight: 600,
                    color: item.color,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily,
                    fontSize: 15,
                    color: COLORS.gray400,
                    marginLeft: 12,
                  }}
                >
                  {item.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
