import type { Round } from "../types/Round";

export function mergeAndFlattenRounds(
  existingRounds: Round[],
  newRounds: Round[]
): { sorted: Round[]; roundMap: Map<number, Round> } {

  const roundById = new Map<number, Round>();

  // Start with existing
  existingRounds.forEach(r => {
    roundById.set(r.id, r);
  });

  // OVERWRITE with fresh rows
  newRounds.forEach(r => {
    roundById.set(r.id, r);
  });

  const merged = Array.from(roundById.values());

  // Build map for lookup
  const roundMap = new Map<number, Round>();
  merged.forEach(r => roundMap.set(r.id, r));

  // sorting logic
  const sorted: Round[] = [];

  const pushRoundWithChildren = (r: Round) => {
    sorted.push(r);
    merged
      .filter(child => child.parent_round_id === r.id)
      .sort((a, b) => a.id - b.id)
      .forEach(pushRoundWithChildren);
  };

  merged
    .filter(r => !r.parent_round_id)
    .sort((a, b) => a.id - b.id)
    .forEach(pushRoundWithChildren);

  return { sorted, roundMap };
}