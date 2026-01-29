import type { PlayerRound } from "../../types/PlayerRound";
import type { PlayerTourney } from "../../types/PlayerTourney";

// Used by RealTime updates on RoundPage
export function upsertPlayerInRound(
  players: PlayerRound[],
  incoming: PlayerRound,
  tourneyPlayers: PlayerTourney[] | null
): PlayerRound[] {
  const playerTourney = getPlayerTourneyById(
    tourneyPlayers,
    incoming.player_tourney_id
  );

  const hydratedPlayerRound: PlayerRound = playerTourney
    ? { ...incoming, player_tourneys: playerTourney }
    : incoming;

  const exists = players.find(pr => pr.id === hydratedPlayerRound.id);
  if (exists) {
    return players.map(pr =>
      pr.id === hydratedPlayerRound.id ? hydratedPlayerRound : pr
    );
  }

  return [...players, hydratedPlayerRound];
}

// Used by RealTime updates on RoundPage
export function deletePlayerFromRound(
  players: PlayerRound[],
  playerRoundId: number
): PlayerRound[] {
  return players.filter(pr => pr.id !== playerRoundId);
}

function getPlayerTourneyById(
  tourneyPlayers: PlayerTourney[] | null,
  playerTourneyId: number | null
): PlayerTourney | null {
  if (!tourneyPlayers || !playerTourneyId) return null;

  return (
    tourneyPlayers.find(tp => tp.id === playerTourneyId) ?? null
  );
}