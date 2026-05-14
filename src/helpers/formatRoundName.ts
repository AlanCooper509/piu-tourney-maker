export function formatRoundName(
  logicalId: string,
  playerNames: string[],
  isInitialSeeding: boolean = false
): string {
  const separator = ": ";
  const prefix = logicalId.split(separator)[0];

  if (playerNames.length === 0) return prefix;

  if (playerNames.length === 1) {
    if (isInitialSeeding) {
      return `${prefix}${separator}${playerNames[0]} (Bye)`;
    } else {
      return `${prefix}${separator}${playerNames[0]} vs. ??`;
    }
  }

  return `${prefix}${separator}${playerNames.join(" vs. ")}`;
}