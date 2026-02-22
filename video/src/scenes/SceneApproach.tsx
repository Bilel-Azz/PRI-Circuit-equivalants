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

type StepProps = {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
};

const PipelineStep: React.FC<StepProps> = ({
  number,
  title,
  description,
  icon,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: SPRING_SNAPPY,
  });

  const scale = interpolate(progress, [0, 1], [0.85, 1]);
  const opacity = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        width: 420,
        transform: `scale(${scale}) translateY(${y}px)`,
        opacity,
      }}
    >
      {/* Step number */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: `${color}20`,
          border: `1px solid ${color}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: monoFontFamily,
            fontSize: 20,
            fontWeight: 700,
            color,
          }}
        >
          {number}
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          padding: "32px 28px",
          backgroundColor: COLORS.bgCard,
          borderRadius: 20,
          border: `1px solid ${color}25`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          boxShadow: `0 0 30px ${color}10`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
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
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.white,
            margin: 0,
            textAlign: "center",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontFamily,
            fontSize: 17,
            color: COLORS.gray400,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export const SceneApproach: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Connecting arrows between cards
  const arrowProgress1 = spring({
    frame,
    fps,
    delay: 80,
    config: SPRING_SMOOTH,
  });
  const arrowProgress2 = spring({
    frame,
    fps,
    delay: 140,
    config: SPRING_SMOOTH,
  });

  return (
    <AbsoluteFill>
      <GridBackground />
      <SceneTitle number={2} title="Notre Approche" />

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: "50%",
          transform: "translate(-50%, 0)",
          opacity: interpolate(
            spring({ frame, fps, delay: 10, config: SPRING_SMOOTH }),
            [0, 1],
            [0, 1],
          ),
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 22,
            color: COLORS.gray400,
            margin: 0,
          }}
        >
          100% données synthétiques - Pipeline supervisé
        </p>
      </div>

      {/* Three pipeline steps */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 60,
          padding: "0 80px",
        }}
      >
        <PipelineStep
          number="01"
          title="Générer"
          description="Circuits RLC aléatoires avec topologies variées (série, parallèle, pont, ladder...)"
          color={COLORS.green}
          delay={30}
          icon={
            <svg width="36" height="36" viewBox="0 0 36 36">
              <rect
                x="6"
                y="6"
                width="10"
                height="10"
                rx="2"
                fill={COLORS.green}
                opacity="0.8"
              />
              <rect
                x="20"
                y="6"
                width="10"
                height="10"
                rx="2"
                fill={COLORS.green}
                opacity="0.5"
              />
              <rect
                x="6"
                y="20"
                width="10"
                height="10"
                rx="2"
                fill={COLORS.green}
                opacity="0.5"
              />
              <rect
                x="20"
                y="20"
                width="10"
                height="10"
                rx="2"
                fill={COLORS.green}
                opacity="0.3"
              />
            </svg>
          }
        />

        {/* Arrow 1 */}
        <div
          style={{
            alignSelf: "center",
            marginTop: 130,
            opacity: arrowProgress1,
          }}
        >
          <svg width="40" height="24">
            <line
              x1="0"
              y1="12"
              x2="28"
              y2="12"
              stroke={COLORS.gray500}
              strokeWidth="2"
            />
            <polygon points="26,6 38,12 26,18" fill={COLORS.gray500} />
          </svg>
        </div>

        <PipelineStep
          number="02"
          title="Calculer Z(f)"
          description="Solveur MNA (Modified Nodal Analysis) pour obtenir l'impédance complexe à 100 fréquences"
          color={COLORS.blue}
          delay={80}
          icon={
            <svg width="36" height="36" viewBox="0 0 36 36">
              <path
                d="M 4 28 Q 12 28 14 18 Q 16 8 22 18 Q 28 28 32 10"
                fill="none"
                stroke={COLORS.blue}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        {/* Arrow 2 */}
        <div
          style={{
            alignSelf: "center",
            marginTop: 130,
            opacity: arrowProgress2,
          }}
        >
          <svg width="40" height="24">
            <line
              x1="0"
              y1="12"
              x2="28"
              y2="12"
              stroke={COLORS.gray500}
              strokeWidth="2"
            />
            <polygon points="26,6 38,12 26,18" fill={COLORS.gray500} />
          </svg>
        </div>

        <PipelineStep
          number="03"
          title="Entraîner"
          description="Modèle CNN + Transformer apprend la relation inverse : Z(f) → Circuit"
          color={COLORS.purple}
          delay={140}
          icon={
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="12"
                fill="none"
                stroke={COLORS.purple}
                strokeWidth="2"
              />
              <circle cx="18" cy="18" r="4" fill={COLORS.purple} opacity="0.8" />
              <line
                x1="18"
                y1="6"
                x2="18"
                y2="12"
                stroke={COLORS.purple}
                strokeWidth="1.5"
              />
              <line
                x1="18"
                y1="24"
                x2="18"
                y2="30"
                stroke={COLORS.purple}
                strokeWidth="1.5"
              />
              <line
                x1="6"
                y1="18"
                x2="12"
                y2="18"
                stroke={COLORS.purple}
                strokeWidth="1.5"
              />
              <line
                x1="24"
                y1="18"
                x2="30"
                y2="18"
                stroke={COLORS.purple}
                strokeWidth="1.5"
              />
            </svg>
          }
        />
      </div>

      {/* Bottom: dataset info */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          gap: 40,
          opacity: interpolate(
            spring({ frame, fps, delay: 200, config: SPRING_SMOOTH }),
            [0, 1],
            [0, 1],
          ),
        }}
      >
        {[
          { label: "Dataset", value: "150k circuits" },
          { label: "Fréquences", value: "1Hz → 1MHz" },
          { label: "Composants", value: "R, L, C" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
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
              {item.label}
            </span>
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 18,
                color: COLORS.gray200,
                fontWeight: 500,
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
