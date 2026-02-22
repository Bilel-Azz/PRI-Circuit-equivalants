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

type SolutionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
};

const SolutionCard: React.FC<SolutionCardProps> = ({
  title,
  description,
  icon,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, delay, config: SPRING_SNAPPY });
  const scale = interpolate(progress, [0, 1], [0.85, 1]);
  const opacity = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 380,
        padding: "32px 28px",
        backgroundColor: COLORS.bgCard,
        borderRadius: 20,
        border: `1px solid ${color}30`,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        transform: `scale(${scale})`,
        opacity,
        boxShadow: `0 0 30px ${color}10`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <h3
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.white,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <p
        style={{
          fontFamily,
          fontSize: 16,
          color: COLORS.gray400,
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
};

export const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Result badge
  const resultProgress = spring({
    frame,
    fps,
    delay: 200,
    config: SPRING_SNAPPY,
  });

  return (
    <AbsoluteFill>
      <GridBackground />
      <SceneTitle number={6} title="La Solution" />

      {/* Three solution cards */}
      <div
        style={{
          position: "absolute",
          top: 170,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          padding: "0 80px",
        }}
      >
        <SolutionCard
          title="Decoder Contraint"
          description="Node_b est prédit conditionnellement à node_a, avec masking pour empêcher node_b = node_a. Résultat : 0% self-loops."
          color={COLORS.blue}
          delay={30}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect
                x="3"
                y="3"
                width="22"
                height="22"
                rx="4"
                fill="none"
                stroke={COLORS.blue}
                strokeWidth="2"
              />
              <line
                x1="8"
                y1="14"
                x2="20"
                y2="14"
                stroke={COLORS.blue}
                strokeWidth="2"
              />
              <line
                x1="14"
                y1="8"
                x2="14"
                y2="20"
                stroke={COLORS.blue}
                strokeWidth="2"
              />
            </svg>
          }
        />

        <SolutionCard
          title="Loss V2"
          description="Pénalités de validité dans la fonction de loss : self-loops, duplicates, présence de GND et IN. Le modèle apprend les contraintes."
          color={COLORS.green}
          delay={80}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28">
              <path
                d="M 4 20 L 10 14 L 16 18 L 24 8"
                fill="none"
                stroke={COLORS.green}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <SolutionCard
          title="Données V3/V4"
          description="Datasets équilibrés avec 150k circuits : résonances marquées, topologies variées, distributions contrôlées."
          color={COLORS.orange}
          delay={130}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect
                x="3"
                y="16"
                width="6"
                height="9"
                rx="1"
                fill={COLORS.orange}
                opacity="0.5"
              />
              <rect
                x="11"
                y="10"
                width="6"
                height="15"
                rx="1"
                fill={COLORS.orange}
                opacity="0.7"
              />
              <rect
                x="19"
                y="4"
                width="6"
                height="21"
                rx="1"
                fill={COLORS.orange}
                opacity="0.9"
              />
            </svg>
          }
        />
      </div>

      {/* Result: 9% → 60% */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          opacity: interpolate(resultProgress, [0, 1], [0, 1]),
          transform: `translate(-50%, 0) scale(${interpolate(resultProgress, [0, 1], [0.9, 1])})`,
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "24px 48px",
          backgroundColor: `${COLORS.green}10`,
          borderRadius: 20,
          border: `1px solid ${COLORS.green}30`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontFamily: monoFontFamily,
              fontSize: 42,
              fontWeight: 800,
              color: COLORS.red,
              opacity: 0.6,
            }}
          >
            9%
          </span>
          <svg width="50" height="30">
            <line
              x1="5"
              y1="15"
              x2="35"
              y2="15"
              stroke={COLORS.gray400}
              strokeWidth="2"
            />
            <polygon points="32,8 48,15 32,22" fill={COLORS.green} />
          </svg>
          <span
            style={{
              fontFamily: monoFontFamily,
              fontSize: 54,
              fontWeight: 800,
              color: COLORS.green,
            }}
          >
            60%
          </span>
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
            fontSize: 22,
            fontWeight: 500,
            color: COLORS.gray300,
          }}
        >
          de circuits valides
        </span>
      </div>
    </AbsoluteFill>
  );
};
