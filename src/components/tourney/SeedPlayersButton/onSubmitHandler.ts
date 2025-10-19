import { handleAddPlayersMapToRounds } from "../../../handlers/handleAddPlayersToRound";
import { toaster } from "../../ui/toaster";

import type { PlayerTourney } from "../../../types/PlayerTourney"
import type { Round } from "../../../types/Round";

interface OnSubmitHandlerProps {
  previewSeeding: PlayerTourney[][]
  filteredRounds: Round[]
}

export default async function onSubmitHandler({ previewSeeding, filteredRounds }: OnSubmitHandlerProps): Promise<boolean> {
  filteredRounds = filteredRounds.slice(0, previewSeeding.length);

  let mapping: Record<number, number[]> = {};
  for (let i = 0; i < filteredRounds.length; i++) {
    const roundId = filteredRounds[i].id;
    const players = previewSeeding[i] || [];

    // extract the player_tourney_id values for this round
    mapping[roundId] = players.map(p => p.id);
  }

  try {
    const { error } = await handleAddPlayersMapToRounds(mapping);

    if (error) {
      toaster.create({
        title: "Seeded Players",
        description: `Error adding players to rounds: ${error.message}`,
        type: "error",
        closable: true,
      });
      return false;
    }

    toaster.create({
      title: "Seeded Players",
      description: `Successfully seeded the players into the rounds!`,
      type: "success",
      closable: true,
    });
    return true;

  } catch (err) {
    toaster.create({
      title: "Seeded Players",
      description: `Unexpected error adding players to rounds: ${err}`,
      type: "error",
      closable: true,
    });
    return false;
  }
}