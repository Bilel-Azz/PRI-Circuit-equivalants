import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { COLORS, CONCEPT_START, CONCEPT_END, OUTRO_START } from "./lib/theme";
import { GridBackground } from "./components/GridBackground";
import { Camera } from "./components/Camera";
import { TitleCard } from "./components/TitleCard";
import { ConceptSection } from "./components/ConceptSection";
import { WebsiteMockup } from "./components/WebsiteMockup";

export const DemoComposition: React.FC = () => {
  const frame = useCurrentFrame();

  // Title card: 9s intro
  const showIntroTitle = frame < 280;
  // Outro title
  const showOutroTitle = frame > OUTRO_START - 50;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Voiceover audio */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* Animated grid background */}
      <GridBackground />

      {/* Title card (intro - 3s) */}
      <TitleCard showTitle={showIntroTitle} />

      {/* Concept explanation section (after title, before site) */}
      <ConceptSection />

      {/* Camera wrapper with website inside */}
      <Camera>
        <WebsiteMockup />
      </Camera>

      {/* Title card (outro - overlaid) */}
      <TitleCard showTitle={showOutroTitle} isOutro />

      {/* Subtle bottom gradient for depth */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          background: `linear-gradient(transparent, ${COLORS.bg}60)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
