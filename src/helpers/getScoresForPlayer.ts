import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";

export function getScoresForPlayer(player: PlayerRound, stages: Stage[] | null) {
  if (!stages) return [];

  return stages.map(stage => {
    const score = stage.scores?.find(s => s.player_round_id === player.id) ?? null;

    // Try to resolve chart
    let chart = stage.charts ?? null; // default to stage.charts
    if (score) {
      const chartPool = stage.chart_pools?.find(pool => pool.chart_id === stage.chart_id);
      if (chartPool?.charts) {
        chart = chartPool.charts;
      }
    }

    return {stage, score, chart};
  });
}