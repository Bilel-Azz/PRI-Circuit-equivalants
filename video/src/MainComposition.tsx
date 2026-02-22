import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SCENES, TRANSITION_DURATION } from "./lib/theme";

import { SceneIntro } from "./scenes/SceneIntro";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneApproach } from "./scenes/SceneApproach";
import { SceneRepresentation } from "./scenes/SceneRepresentation";
import { SceneModel } from "./scenes/SceneModel";
import { SceneChallenge } from "./scenes/SceneChallenge";
import { SceneSolution } from "./scenes/SceneSolution";
import { SceneResults } from "./scenes/SceneResults";
import { SceneOutro } from "./scenes/SceneOutro";

const transitionTiming = linearTiming({
  durationInFrames: TRANSITION_DURATION,
});
const transitionPresentation = fade();

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
          <SceneIntro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.problem}>
          <SceneProblem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.approach}>
          <SceneApproach />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.representation}>
          <SceneRepresentation />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.model}>
          <SceneModel />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.challenge}>
          <SceneChallenge />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.solution}>
          <SceneSolution />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.results}>
          <SceneResults />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transitionPresentation}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.outro}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
