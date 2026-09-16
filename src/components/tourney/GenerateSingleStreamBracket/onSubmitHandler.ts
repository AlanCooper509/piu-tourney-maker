import { toaster } from "../../ui/toaster";

import { handleDeleteRoundPoolsInTourney } from "../../../handlers/round/handleDeleteRoundPoolsInTourney";
import { handleDeleteRoundsInTourney } from "../../../handlers/round/handleDeleteRoundsInTourney";
import { generateBracketFromTemplate } from "../../../handlers/bracketGenerator/generateBracketFromTemplate";

import type { PlayerTourney } from "../../../types/PlayerTourney";

interface OnSubmitHandlerProps {
  tourneyId: number;
  template: unknown;
  initialSeeding: (PlayerTourney | null)[][];
}

export default async function onSubmitHandler({
  tourneyId,
  template,
  initialSeeding
}: OnSubmitHandlerProps): Promise<boolean> {
  try {
    await handleDeleteRoundsInTourney(tourneyId);
    await handleDeleteRoundPoolsInTourney(tourneyId);
    await generateBracketFromTemplate(tourneyId, template, initialSeeding);

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
