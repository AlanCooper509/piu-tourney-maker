import { toaster } from "../../ui/toaster";

import { handleDeleteRoundPoolsInTourney } from "../../../handlers/round/handleDeleteRoundPoolsInTourney";
import { handleDeleteRoundsInTourney } from "../../../handlers/round/handleDeleteRoundsInTourney";
import { generateBracketFromTemplate } from "../../../handlers/bracketGenerator/generateBracketFromTemplate";

import type { PlayerTourney } from "../../../types/PlayerTourney";
import type { TourneyType } from "../../../types/Tourney";

interface OnSubmitHandlerProps {
  tourneyId: number;
  tourneyType: TourneyType | null | undefined;
  template: unknown;
  initialSeeding: (PlayerTourney | null)[][];
}

export default async function onSubmitHandler({
  tourneyId,
  tourneyType,
  template,
  initialSeeding
}: OnSubmitHandlerProps): Promise<boolean> {
  try {
    await handleDeleteRoundsInTourney(tourneyId);
    await handleDeleteRoundPoolsInTourney(tourneyId);
    await generateBracketFromTemplate(tourneyId, template, initialSeeding, tourneyType);

    toaster.create({
      title: "Generate Bracket",
      description: "Successfully generated the bracket!",
      type: "success",
      closable: true,
    });

    return true;
  } catch (err) {
    toaster.create({
      title: "Generate Bracket",
      description: `Unexpected error generating the bracket: ${err}`,
      type: "error",
      closable: true,
    });

    return false;
  }
}
