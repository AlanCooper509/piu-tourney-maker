import { getScoresForPlayer } from "./getScoresForPlayer";

import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";

interface calculatePlayerRankingsInRoundProps {
  players: PlayerRound[] | null;
  stages: Stage[] | null;
}

export default function calculatePlayerRankingsInRound({players, stages}: calculatePlayerRankingsInRoundProps) {
  if (!stages) throw new Error('Stages are Required');
  if (!players) throw new Error('PlayerRounds are required');

  // get mapping of player of scores
  let scoreMapping: Record<number, any> = {};
  for (let player of players) {
    let scores = getScoresForPlayer(player, stages);
    scoreMapping[player.id] = scores;
  }

  // calculate the cumulative score per player
  let totalScores: Record<number, number> = {};

  for (const [playerIdStr, scores] of Object.entries(scoreMapping)) {
    const playerId = parseInt(playerIdStr);
    const total = scores.reduce((sum: number, entry: any) => {
      return sum + (entry.score?.score ?? 0);
    }, 0);
    totalScores[playerId] = total;
  }

  // descending order entries of:
  // [playerRoundId, cumulativeScore] 
  const sortedEntries: [number, number][] = Object.entries(totalScores)
    .map(([id, score]) => [parseInt(id), score] as [number, number])
    .sort((a, b) => b[1] - a[1]);

  return sortedEntries;
}