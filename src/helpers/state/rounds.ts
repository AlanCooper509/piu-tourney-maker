import type { Round } from "../../types/Round";

export function upsertRound(
  rounds: Round[],
  incoming: Round
): Round[] {
  const exists = rounds.some(r => r.id === incoming.id);

  if (exists) {
    return rounds.map(r =>
      r.id === incoming.id ? incoming : r
    );
  }

  return [...rounds, incoming];
}

export function deleteRound(
  rounds: Round[],
  roundId: number
): Round[] {
  return rounds.filter(r => r.id !== roundId);
}