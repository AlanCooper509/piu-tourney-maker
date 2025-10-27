import { getScoresForPlayer } from "./getScoresForPlayer";
import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import type { Round } from "../types/Round";

interface calculatePlayerRankingsInRoundProps {
  players: PlayerRound[] | null;
  stages: Stage[] | null;
  round: Round;
}

export default function calculatePlayerRankingsInRound({
  players,
  stages,
  round
}: calculatePlayerRankingsInRoundProps) {
  if (!stages) throw new Error("Stages are required");
  if (!players) throw new Error("PlayerRounds are required");

  const pointsScale = round?.points_per_stage
    ? round.points_per_stage.split(",").map(str => Number(str.trim()))
    : [];

  // Map player -> stage scores
  const scoreMapping: Record<number, { stageId: number; score: number | null }[]> = {};
  for (const player of players) {
    scoreMapping[player.id] = getScoresForPlayer(player, stages).map(entry => ({
      stageId: entry.stage.id,
      score: entry.score?.score ?? null
    }));
  }

  // Precompute cumulative scores for all players
  const cumulativeScores: Record<number, number> = {};
  for (const player of players) {
    cumulativeScores[player.id] = scoreMapping[player.id].reduce(
      (sum, entry) => sum + (entry.score ?? 0),
      0
    );
  }

  // Compute totals depending on scoring type
  const totals: Record<number, number> = {};
  if (pointsScale.length > 0) {
    // Points-based scoring
    for (const player of players) totals[player.id] = 0;

    for (const stage of stages) {
      // Rank players for this stage
      const ranked = players
        .map(player => ({
          playerId: player.id,
          score: scoreMapping[player.id].find(s => s.stageId === stage.id)?.score ?? null
        }))
        .filter((r): r is { playerId: number; score: number } => r.score !== null)
        .sort((a, b) => b.score - a.score);

      // Tie-aware awarding
      ranked.forEach(r => {
        const tieIndex = ranked.findIndex(x => x.score === r.score);
        const points = pointsScale[tieIndex] ?? 0;
        totals[r.playerId] += points;
      });
    }
  } else {
    // Cumulative scoring
    for (const player of players) {
      totals[player.id] = cumulativeScores[player.id];
    }
  }

  // Return sorted rankings: primary = points/cumulative, secondary = cumulative for tiebreaker
  return Object.entries(totals)
    .map(([id, total]) => [parseInt(id), total] as [number, number])
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]; // primary: total points
      return cumulativeScores[b[0]] - cumulativeScores[a[0]]; // tiebreaker: raw cumulative
    });
}