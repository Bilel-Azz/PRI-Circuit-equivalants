import "./index.css";
import { Composition, Folder } from "remotion";
import { DemoComposition } from "./DemoComposition";
import { MainComposition } from "./MainComposition";
import {
  WIDTH,
  HEIGHT,
  FPS,
  TOTAL_DURATION,
  DEMO_DURATION,
  SCENES,
} from "./lib/theme";

// Import scenes for individual preview
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneApproach } from "./scenes/SceneApproach";
import { SceneRepresentation } from "./scenes/SceneRepresentation";
import { SceneModel } from "./scenes/SceneModel";
import { SceneChallenge } from "./scenes/SceneChallenge";
import { SceneSolution } from "./scenes/SceneSolution";
import { SceneResults } from "./scenes/SceneResults";
import { SceneOutro } from "./scenes/SceneOutro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main: Product demo video (2 min) */}
      <Composition
        id="CircuitDemo"
        component={DemoComposition}
        durationInFrames={DEMO_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* Old slideshow version */}
      <Folder name="Slideshow">
        <Composition
          id="CircuitSynthesisAI"
          component={MainComposition}
          durationInFrames={TOTAL_DURATION}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>

      {/* Individual scenes for preview/debugging */}
      <Folder name="Scenes">
        <Composition
          id="01-Intro"
          component={SceneIntro}
          durationInFrames={SCENES.intro}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="02-Problem"
          component={SceneProblem}
          durationInFrames={SCENES.problem}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="03-Approach"
          component={SceneApproach}
          durationInFrames={SCENES.approach}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="04-Representation"
          component={SceneRepresentation}
          durationInFrames={SCENES.representation}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="05-Model"
          component={SceneModel}
          durationInFrames={SCENES.model}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="06-Challenge"
          component={SceneChallenge}
          durationInFrames={SCENES.challenge}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="07-Solution"
          component={SceneSolution}
          durationInFrames={SCENES.solution}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="08-Results"
          component={SceneResults}
          durationInFrames={SCENES.results}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="09-Outro"
          component={SceneOutro}
          durationInFrames={SCENES.outro}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>
    </>
  );
};
