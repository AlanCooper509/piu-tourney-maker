import type { Round } from "../types/Round";
import type { RoundPool } from "../types/RoundPool";

/**
 * Merges existing rounds with new data and flattens them into a sorted array
 * based on RoundPool sort_order, then round creation order within each pool.
 *
 * Rounds no longer form a strict single-parent tree (a round_advancements rule can
 * route into a round from more than one source), so nesting a round directly under
 * "its parent" isn't well-defined -- rounds within a pool are ordered by id instead.
 */
export function mergeAndFlattenRounds(
  existingRounds: Round[],
  newRounds: Round[],
  roundPools: RoundPool[] = []
): { sorted: Round[]; roundMap: Map<number, Round> } {

  const roundById = new Map<number, Round>();

  // Combine existing and fresh rows into a single Map to handle overwrites
  existingRounds.forEach(r => roundById.set(r.id, r));
  newRounds.forEach(r => roundById.set(r.id, r));

  const merged = Array.from(roundById.values());
  const roundMap = new Map<number, Round>();
  merged.forEach(r => roundMap.set(r.id, r));

  // 2. Sort pools based on the actual 'sort_order' metadata
  const uniquePoolIds = Array.from(new Set(merged.map(r => r.round_pool_id)))
    .sort((a, b) => {
      // Priority 1: Ungrouped rounds (null/undefined) always go to the top
      if (a === null || a === undefined) return -1;
      if (b === null || b === undefined) return 1;

      // Priority 2: Use the sort_order from the roundPools metadata
      const poolA = roundPools.find(p => p.id === a);
      const poolB = roundPools.find(p => p.id === b);

      const orderA = poolA?.sort_order ?? Infinity;
      const orderB = poolB?.sort_order ?? Infinity;

      // If sort_orders are equal or missing, fallback to ID comparison
      if (orderA === orderB) return a - b;

      return orderA - orderB;
    });

  // 3. For each unique pool (in order), list its rounds in creation order
  const sorted: Round[] = uniquePoolIds.flatMap(poolId =>
    merged
      .filter(r => r.round_pool_id === poolId)
      .sort((a, b) => a.id - b.id)
  );

  return { sorted, roundMap };
}