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

/** Fallback display text for a rule with no TO-provided label, e.g. "Rank 2" or "Rank 3+". */
export function formatRankRangeLabel(rule: RoundAdvancement): string {
  if (rule.rank_end == null) return `Rank ${rule.rank_start}+`;
  if (rule.rank_end === rule.rank_start) return `Rank ${rule.rank_start}`;
  return `Rank ${rule.rank_start}-${rule.rank_end}`;
}
