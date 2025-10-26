import { getScoresForPlayer } from "./getScoresForPlayer";

import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import type { Round } from "../types/Round";

interface calculatePlayerRankingsInRoundProps {
  players: PlayerRound[] | null;
  stages: Stage[] | null;
  round: Round;
}

export default function calculatePlayerRankingsInRound({players, stages, round}: calculatePlayerRankingsInRoundProps) {
  if (!stages) throw new Error('Stages are Required');
  if (!players) throw new Error('PlayerRounds are required');
  const points_scale = round?.points_per_stage ? round.points_per_stage.split(',').map(str => Number(str.trim())) : [];

  // Get mapping of player -> stage score entries
  let scoreMapping: Record<number, any[]> = {};
  for (let player of players) {
    scoreMapping[player.id] = getScoresForPlayer(player, stages);
  }
  let totals: Record<number, number> = {};

  // points_per_stage is something like 4,3,2,1 representing "points per position" and awards 0 otherwise
  if (round?.points_per_stage) {
    for (const player of players) totals[player.id] = 0;
    for (const stage of stages) {
      const ranked = players
        .map(player => {
          const entry = scoreMapping[player.id].find(s => s.stageId === stage.id);
          return {
            playerId: player.id,
            score: entry?.score?.score ?? null
          };
        })
        .filter(r => r.score !== null) // skip null scores entirely
        .sort((a, b) => b.score! - a.score!);

      // Tie-aware awarding
      ranked.forEach((r) => {
        const tieIndex = ranked.findIndex(x => x.score === r.score);
        const points = points_scale[tieIndex] ?? 0;
        totals[r.playerId] += points;
      });
    }
  }   
  else /* Cumulative */ {
    for (const [playerIdStr, scores] of Object.entries(scoreMapping)) {
      const playerId = parseInt(playerIdStr);
      totals[playerId] = scores.reduce((sum, entry) => sum + (entry.score?.score ?? 0), 0);
    }
  }

  // Return sorted rankings: [playerId, total]
  return Object.entries(totals)
    .map(([id, total]) => [parseInt(id), total] as [number, number])
    .sort((a, b) => b[1] - a[1]);
}