import { toaster } from "../../ui/toaster";

import { handleDeleteRoundPoolsInTourney } from "../../../handlers/round/handleDeleteRoundPoolsInTourney";
import { handleDeleteRoundsInTourney } from "../../../handlers/round/handleDeleteRoundsInTourney";
import { generateBracketFromTemplate } from "../../../handlers/bracketGenerator/generateBracketFromTemplate";
import de2 from "../../../data/brackets/double-elimination/2-person-bracket.json";
import de4 from "../../../data/brackets/double-elimination/4-person-bracket.json";
import de8 from "../../../data/brackets/double-elimination/8-person-bracket.json";
import de16 from "../../../data/brackets/double-elimination/16-person-bracket.json";
import de32 from "../../../data/brackets/double-elimination/32-person-bracket.json";

import type { PlayerTourney } from "../../../types/PlayerTourney";

const BRACKET_TEMPLATES: Record<number, any> = {
  2: de2,
  4: de4,
  8: de8,
  16: de16,
  32: de32,
};

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

  // TODO: fine short-term while validation logic in parent class only supports double elim
  const template = BRACKET_TEMPLATES[bracketSize];

  if (!template) {
    toaster.create({
      title: "Unsupported Bracket Size",
      description: `${bracketSize} players is outside our supported range (2-32).`,
      type: "error",
    });
    return false;
  }

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