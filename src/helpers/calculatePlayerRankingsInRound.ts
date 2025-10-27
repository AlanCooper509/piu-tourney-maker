import { getScoresForPlayer } from "./getScoresForPlayer";
import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import type { Round } from "../types/Round";

type PointsMap = Map<string, number>;

interface calculatePlayerRankingsInRoundProps {
  players: PlayerRound[] | null;
  stages: Stage[] | null;
  round: Round;
}

interface CalculateResult {
  rankings: [number, number][]; // [playerId, totalPointsOrTotalScore]
  pointsMap: PointsMap; // key: `${playerId}-${stageId}`;
  cumulativeScores: Record<number, number>;
}

export default function calculatePlayerRankingsInRound({
  players,
  stages,
  round
}: calculatePlayerRankingsInRoundProps): CalculateResult {
  if (!stages) throw new Error("Stages are required");
  if (!players) throw new Error("PlayerRounds are required");

  const pointsScale = round?.points_per_stage
    ? round.points_per_stage.split(",").map(str => Number(str.trim()))
    : [];

  // Map player -> stage scores
  const scoreMapping: Record<number, { stageId: number; score: number | null }[]> = {};
  for (const player of players) {
    scoreMapping[player.id] = getScoresForPlayer(player, stages).map(entry => ({
      stageId: entry.stage.id,              // NOTE: using stage.id here
      score: entry.score?.score ?? null
    }));
  }

  // Precompute cumulative scores for tiebreakers
  const cumulativeScores: Record<number, number> = {};
  for (const player of players) {
    cumulativeScores[player.id] = scoreMapping[player.id].reduce(
      (sum, entry) => sum + (entry.score ?? 0),
      0
    );
  }

  // totals object (either points totals or cumulative totals)
  const totals: Record<number, number> = {};
  // pointsMap to record per-player-per-stage awarded points
  const pointsMap: PointsMap = new Map();

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

      // Tie-aware awarding (dense rank)
      ranked.forEach(r => {
        const tieIndex = ranked.findIndex(x => x.score === r.score);
        const points = pointsScale[tieIndex] ?? 0;
        totals[r.playerId] += points;
        pointsMap.set(`${r.playerId}-${stage.id}`, points); // record per-stage points
      });

      // For players who had no score (filtered out), optionally set 0 entries
      const rankedIds = new Set(ranked.map(x => x.playerId));
      players.forEach(pl => {
        if (!rankedIds.has(pl.id)) {
          pointsMap.set(`${pl.id}-${stage.id}`, 0);
        }
      });
    }
  } else {
    // Cumulative scoring
    for (const player of players) {
      totals[player.id] = cumulativeScores[player.id];
      // in cumulative mode, you may still set pointsMap to 0 for all player-stage combos if you want UI consistency
      stages.forEach(st => pointsMap.set(`${player.id}-${st.id}`, 0));
    }
  }

  // Build the sorted rankings array (same as before)
  const rankings = Object.entries(totals)
    .map(([id, total]) => [parseInt(id), total] as [number, number])
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]; // primary: total points
      return cumulativeScores[b[0]] - cumulativeScores[a[0]]; // tiebreaker: raw cumulative
    });

  return { rankings, pointsMap, cumulativeScores };
}