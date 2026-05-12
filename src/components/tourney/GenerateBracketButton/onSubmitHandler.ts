import { toaster } from "../../ui/toaster";

import { handleDeleteRoundPoolsInTourney } from "../../../handlers/round/handleDeleteRoundPoolsInTourney";
import { handleDeleteRoundsInTourney } from "../../../handlers/round/handleDeleteRoundsInTourney";
import { generateBracketFromTemplate } from "../../../handlers/bracketGenerator/generateBracketFromTemplate";
import de8 from "../../../data/brackets/double-elimination/8-person-bracket.json";

import type { PlayerTourney } from "../../../types/PlayerTourney";

interface OnSubmitHandlerProps {
  tourneyId: number;
  matches: (PlayerTourney | null)[][];
  bracketSize: number;
}

export default async function onSubmitHandler({
  tourneyId,
  matches,
  bracketSize
}: OnSubmitHandlerProps): Promise<boolean> {

  if (bracketSize !== 8) {
    toaster.create({
      title: "Invalid Bracket Size",
      description: "Only 8-person brackets are supported at this time!",
      type: "error",
      closable: true,
    });
    return false;
  }

  const template = de8;
  try {
    await handleDeleteRoundsInTourney(tourneyId);
    await handleDeleteRoundPoolsInTourney(tourneyId);
    await generateBracketFromTemplate(tourneyId, template, matches);

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