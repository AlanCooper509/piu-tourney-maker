import type { PlayerTourney } from "../../types/PlayerTourney";

export function upsertPlayerTourney(
  players: PlayerTourney[],
  incoming: PlayerTourney
): PlayerTourney[] {
  const exists = players.some(p => p.id === incoming.id);

  if (exists) {
    return players.map(p =>
      p.id === incoming.id ? incoming : p
    );
  }

  return [...players, incoming];
}

export function deletePlayerTourney(
  players: PlayerTourney[],
  playerTourneyId: number
): PlayerTourney[] {
  return players.filter(p => p.id !== playerTourneyId);
}