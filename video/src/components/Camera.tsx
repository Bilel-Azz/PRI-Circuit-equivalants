import { useCurrentFrame, interpolate, Easing } from "remotion";
import { CAMERA_KEYFRAMES } from "../lib/theme";

type Props = {
  children: React.ReactNode;
};

export const Camera: React.FC<Props> = ({ children }) => {
  const frame = useCurrentFrame();

  // Find the two surrounding keyframes
  const frames = CAMERA_KEYFRAMES.map((k) => k.frame);

  // Interpolate scale
  const scale = interpolate(
    frame,
    frames,
    CAMERA_KEYFRAMES.map((k) => k.scale),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  // Interpolate X translation (percentage of container)
  const translateX = interpolate(
    frame,
    frames,
    CAMERA_KEYFRAMES.map((k) => k.x),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  // Interpolate Y translation
  const translateY = interpolate(
    frame,
    frames,
    CAMERA_KEYFRAMES.map((k) => k.y),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};
