import type { TourneyType } from "../types/Tourney";

export function formatRoundName(
  logicalId: string,
  playerNames: string[],
  tourneyType: TourneyType | null | undefined,
  isInitialSeeding: boolean = false
): string {
  const separator = ": ";
  const prefix = logicalId.split(separator)[0];

  if (playerNames.length === 0) return prefix;

  // Only Double Elimination rounds are named after their matchup. Other
  // bracket formats (e.g. Single Elimination) keep their generic round/pool
  // name instead - simpler and less wordy, and it sidesteps having to decide
  // how to render a matchup name once more than two players share a round.
  if (tourneyType !== "Double Elimination") return prefix;

  if (playerNames.length === 1) {
    if (isInitialSeeding) {
      return `${prefix}${separator}${playerNames[0]} (Bye)`;
    } else {
      return `${prefix}${separator}${playerNames[0]} vs. ??`;
    }
  }

  return `${prefix}${separator}${playerNames.join(" vs. ")}`;
}