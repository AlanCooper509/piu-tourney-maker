import type { RoundAdvancement } from "../types/RoundAdvancement";

/**
 * Finds the round_advancements row covering a given finishing rank within a round,
 * or undefined if no row covers it (i.e. that placement is eliminated).
 */
export function resolveAdvancementRule(
  rank: number,
  roundAdvancements: RoundAdvancement[]
): RoundAdvancement | undefined {
  return roundAdvancements.find(
    a => a.rank_start <= rank && (a.rank_end == null || rank <= a.rank_end)
  );
}

export function resolveAdvancementDestination(
  rank: number,
  roundAdvancements: RoundAdvancement[]
): number | undefined {
  return resolveAdvancementRule(rank, roundAdvancements)?.destination_round_id;
}

/** Converts 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th", etc. */
export function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

/** Ordinal rank range covered by a rule, e.g. "1st", "1st - 2nd", or "3rd+" for an open-ended rule. */
export function formatOrdinalRankRange(rule: RoundAdvancement): string {
  if (rule.rank_end == null) return `${ordinal(rule.rank_start)}+`;
  if (rule.rank_end === rule.rank_start) return ordinal(rule.rank_start);
  return `${ordinal(rule.rank_start)} - ${ordinal(rule.rank_end)}`;
}

/**
 * Display label for an advancement rule: the TO-provided label with its rank range
 * appended, e.g. "Winner (1st)" or "Winner (1st - 2nd)" — or just the range,
 * e.g. "3rd+", when no label is set.
 */
export function formatAdvancementLabel(rule: RoundAdvancement): string {
  const range = formatOrdinalRankRange(rule);
  return rule.label ? `${rule.label} (${range})` : range;
}

/** True if two rank ranges (open-ended when rank_end is null) cover any rank in common. */
export function rangesOverlap(
  a: { rank_start: number; rank_end?: number | null },
  b: { rank_start: number; rank_end?: number | null }
): boolean {
  const aEnd = a.rank_end ?? Infinity;
  const bEnd = b.rank_end ?? Infinity;
  return a.rank_start <= bEnd && b.rank_start <= aEnd;
}
