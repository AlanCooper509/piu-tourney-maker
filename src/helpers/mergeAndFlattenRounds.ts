import type { Round } from "../types/Round";

export function mergeAndFlattenRounds(
  existingRounds: Round[],
  newRounds: Round[]
): { sorted: Round[]; roundMap: Map<number, Round> } {
  // Merge without duplicates
  const merged = [...existingRounds];
  newRounds.forEach(r => {
    if (!existingRounds.find(er => er.id === r.id)) {
      merged.push(r);
    }
  });

  // Build map for quick lookup
  const roundMap = new Map<number, Round>();
  merged.forEach(r => roundMap.set(r.id, r));

  // Flatten rounds by parent
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