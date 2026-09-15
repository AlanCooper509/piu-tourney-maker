import type { Round } from "../types/Round";
import type { RoundAdvancement } from "../types/RoundAdvancement";

/**
 * Returns the "entry" rounds of a tourney/pool -- rounds nobody's advancement
 * rule routes players into. Replaces the old `parent_round_id === null` check.
 */
export function getEntryRounds(rounds: Round[], roundAdvancements: RoundAdvancement[]): Round[] {
  const destinationRoundIds = new Set(roundAdvancements.map(a => a.destination_round_id));
  return rounds.filter(r => !destinationRoundIds.has(r.id));
}
