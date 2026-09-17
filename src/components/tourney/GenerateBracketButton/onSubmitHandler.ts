import { toaster } from "../../ui/toaster";

import { handleDeleteRoundPoolsInTourney } from "../../../handlers/round/handleDeleteRoundPoolsInTourney";
import { handleDeleteRoundsInTourney } from "../../../handlers/round/handleDeleteRoundsInTourney";
import { generateBracketFromTemplate } from "../../../handlers/bracketGenerator/generateBracketFromTemplate";
import de2 from "../../../data/brackets/double-elimination/2-person-bracket.json";
import de4 from "../../../data/brackets/double-elimination/4-person-bracket.json";
import de8 from "../../../data/brackets/double-elimination/8-person-bracket.json";
import de16 from "../../../data/brackets/double-elimination/16-person-bracket.json";
import de32 from "../../../data/brackets/double-elimination/32-person-bracket.json";
import se2 from "../../../data/brackets/single-elimination/2-person-bracket.json";
import se4 from "../../../data/brackets/single-elimination/4-person-bracket.json";
import se8 from "../../../data/brackets/single-elimination/8-person-bracket.json";
import se16 from "../../../data/brackets/single-elimination/16-person-bracket.json";
import se32 from "../../../data/brackets/single-elimination/32-person-bracket.json";

import type { PlayerTourney } from "../../../types/PlayerTourney";
import type { TourneyType } from "../../../types/Tourney";

const BRACKET_TEMPLATES_BY_TYPE: Record<string, Record<number, any>> = {
  "Double Elimination": { 2: de2, 4: de4, 8: de8, 16: de16, 32: de32 },
  "Single Elimination": { 2: se2, 4: se4, 8: se8, 16: se16, 32: se32 },
};

interface OnSubmitHandlerProps {
  tourneyId: number;
  tourneyType: TourneyType | null | undefined;
  matches: (PlayerTourney | null)[][];
  bracketSize: number;
}

export default async function onSubmitHandler({
  tourneyId,
  tourneyType,
  matches,
  bracketSize
}: OnSubmitHandlerProps): Promise<boolean> {
  const templates = tourneyType ? BRACKET_TEMPLATES_BY_TYPE[tourneyType] : undefined;
  const template = templates?.[bracketSize];

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