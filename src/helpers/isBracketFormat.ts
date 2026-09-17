import type { TourneyType } from "../types/Tourney";

/**
 * True for a bracket-style tournament (players are seeded into a template
 * bracket of pools/rounds, advancing by rank through round_advancements) as
 * opposed to a single-stream tournament (Gauntlet, Waterfall (Redemption))
 * where every player competes through the same sequence of rounds.
 */
export function isBracketFormat(type: TourneyType | null | undefined): boolean {
  return type === "Double Elimination" || type === "Single Elimination";
}
