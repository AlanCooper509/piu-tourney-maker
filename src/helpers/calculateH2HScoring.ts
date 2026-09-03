import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import type { Round } from "../types/Round";

interface CalculateH2HScoringProps {
  players: PlayerRound[] | null;
  stages: Stage[] | null;
  round: Round | null;
}

interface H2HScoringResult {
  totalsMap: Record<number, number>;
  hasScoresMap: Record<number, boolean>;
}

export function calculateH2HScoring({ players, stages, round }: CalculateH2HScoringProps): H2HScoringResult {
  const totalsMap: Record<number, number> = {};
  const hasScoresMap: Record<number, boolean> = {};

  if (!players || !stages) {
    return { totalsMap, hasScoresMap };
  }

  players.forEach(player => {
    totalsMap[player.id] = 0;
    hasScoresMap[player.id] = false;
  });

  const isPointsBased = Boolean(round?.points_per_stage);
  const pointsScale = round?.points_per_stage
    ? round.points_per_stage.split(",").map(str => Number(str.trim()))
    : [];

  stages.forEach((stage) => {
    const stageScores = players
      .map(p => {
        const matchedScore = stage.scores?.find(s => s.player_round_id === p.id);
        return {
          playerId: p.id,
          score: matchedScore && matchedScore.score !== undefined && matchedScore.score !== null
            ? Number(matchedScore.score)
            : null
        };
      });

    const isStageIncomplete = stageScores.some(item => item.score === null);
    if (isStageIncomplete) {
      return;
    }

    stageScores.forEach(item => {
      hasScoresMap[item.playerId] = true;
    });

    if (isPointsBased && pointsScale.length > 0) {
      const validScores = stageScores as { playerId: number; score: number }[];

      validScores.sort((a, b) => b.score - a.score);
      validScores.forEach((item) => {
        const tieIndex = validScores.findIndex(x => x.score === item.score);
        const pointsAwarded = pointsScale[tieIndex] ?? 0;
        totalsMap[item.playerId] += pointsAwarded;
      });
    } else {
      stageScores.forEach(item => {
        if (item.score !== null) {
          totalsMap[item.playerId] += item.score;
        }
      });
    }
  });

  return { totalsMap, hasScoresMap };
}
