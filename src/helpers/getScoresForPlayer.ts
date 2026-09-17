import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import { getStageChart } from "./getStageChart";

export function getScoresForPlayer(player: PlayerRound, stages: Stage[] | null) {
  if (!stages) return [];

  return stages.map(stage => {
    const score = stage.scores?.find(s => s.player_round_id === player.id) ?? null;

    // Try to resolve chart
    let chart = getStageChart(stage); // joined row, or an imported snapshot
    if (score) {
      const chartPool = stage.chart_pools?.find(pool => pool.chart_id === stage.chart_id);
      if (chartPool?.charts) {
        chart = chartPool.charts;
      }
    }

    return {stage, score, chart};
  });
}