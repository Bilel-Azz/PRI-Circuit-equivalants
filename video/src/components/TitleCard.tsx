import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, OUTRO_START, DEMO_DURATION } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { SPRING_SMOOTH, SPRING_SNAPPY } from "../lib/animations";

type Props = {
  showTitle: boolean; // true during intro (frame 0-150) and outro (frame 3200+)
  isOutro?: boolean;
};

export const TitleCard: React.FC<Props> = ({ showTitle, isOutro = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!showTitle) return null;

  const actualDelay = isOutro ? 20 : 10;

  const localFrame = isOutro ? frame - OUTRO_START : frame;

  const titleProgress = spring({
    frame: localFrame,
    fps,
    delay: actualDelay,
    config: SPRING_SMOOTH,
  });

  const subtitleProgress = spring({
    frame: localFrame,
    fps,
    delay: actualDelay + 12,
    config: SPRING_SMOOTH,
  });

  const tagsProgress = spring({
    frame: localFrame,
    fps,
    delay: actualDelay + 25,
    config: SPRING_SMOOTH,
  });

  // Fade out at end of intro (9s title)
  const introFadeOut = isOutro
    ? 1
    : interpolate(frame, [240, 270], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // Fade out at very end for outro
  const outroFadeOut = isOutro
    ? interpolate(frame, [DEMO_DURATION - 40, DEMO_DURATION - 5], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const opacity = introFadeOut * outroFadeOut;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        zIndex: 100,
        opacity,
        pointerEvents: "none",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.blue}18 0%, transparent 70%)`,
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
        }}
      />

      <h1
        style={{
          fontFamily,
          fontSize: isOutro ? 52 : 76,
          fontWeight: 800,
          color: COLORS.white,
          letterSpacing: "-0.03em",
          margin: 0,
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        Circuit Synthesis
        <span style={{ color: COLORS.blue }}> AI</span>
      </h1>

      <p
        style={{
          fontFamily,
          fontSize: isOutro ? 22 : 26,
          color: COLORS.gray400,
          margin: 0,
          opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(subtitleProgress, [0, 1], [15, 0])}px)`,
        }}
      >
        De la courbe d'impédance au circuit équivalent
      </p>

      {/* Tech tags */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 16,
          opacity: interpolate(tagsProgress, [0, 1], [0, 1]),
        }}
      >
        {["PyTorch", "CNN + Transformer", "Next.js", "FastAPI"].map(
          (tag, i) => {
            const tagP = spring({
              frame: localFrame,
              fps,
              delay: actualDelay + 50 + i * 8,
              config: SPRING_SMOOTH,
            });
            return (
              <div
                key={tag}
                style={{
                  padding: "7px 18px",
                  borderRadius: 100,
                  border: `1px solid ${COLORS.gray600}`,
                  backgroundColor: `${COLORS.bgCard}80`,
                  opacity: interpolate(tagP, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(tagP, [0, 1], [10, 0])}px)`,
                }}
              >
                <span
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 14,
                    color: COLORS.gray300,
                  }}
                >
                  {tag}
                </span>
              </div>
            );
          },
        )}
      </div>

      {/* Credits (outro only) */}
      {isOutro && (
        <p
          style={{
            fontFamily,
            fontSize: 18,
            color: COLORS.gray500,
            marginTop: 30,
            opacity: interpolate(
              spring({
                frame: localFrame,
                fps,
                delay: 60,
                config: SPRING_SMOOTH,
              }),
              [0, 1],
              [0, 0.7],
            ),
          }}
        >
          PRI - Bilel Azzouzi
        </p>
      )}
    </div>
  );
};
