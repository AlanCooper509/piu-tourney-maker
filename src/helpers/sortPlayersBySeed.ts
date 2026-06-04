import type { PlayerRound } from "../types/PlayerRound";

export default function sortPlayersBySeed(players: PlayerRound[]): PlayerRound[] {
  return [...players].sort((a, b) => {
    const seedA = a.player_tourneys?.seed ?? Infinity;
    const seedB = b.player_tourneys?.seed ?? Infinity;

    if (seedA !== seedB) {
      return seedA - seedB;
    }
    
    return a.player_tourney_id - b.player_tourney_id;
  });
}