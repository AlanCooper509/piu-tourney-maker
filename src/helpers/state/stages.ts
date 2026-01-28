import chartsData from "../../data/charts-v2_12_0.json";
import type { Chart } from "../../types/Chart";

import type { ChartPool } from "../../types/ChartPool";
import type { Score } from "../../types/Score";
import type { Stage } from "../../types/Stage";

// Used by RealTime updates on RoundPage
export function upsertScoreInStages(
  stages: Stage[],
  incoming: Score
): Stage[] {
  return stages.map(stage => {
    if (stage.id !== incoming.stage_id) return stage;

    const scores = stage.scores ?? [];

    const existingIndex = scores.findIndex(
      s => s.id === incoming.id
    );

    const newScores =
      existingIndex >= 0
        ? scores.map(s =>
            s.id === incoming.id ? { ...s, ...incoming } : s
          )
        : [...scores, incoming];

    return {
      ...stage,
      scores: newScores
    };
  });
}

// Used by RealTime updates on RoundPage
export function deleteScoreFromStages(
  stages: Stage[],
  scoreId: number
): Stage[] {
  return stages.map(stage => {
    if (!stage.scores?.some(s => s.id === scoreId)) return stage;

    return {
      ...stage,
      scores: stage.scores.filter(s => s.id !== scoreId)
    };
  });
}

// Used by RealTime updates on RoundPage
export function upsertStage(
  stages: Stage[],
  incoming: Stage
): Stage[] {
  const existing = stages.find(s => s.id === incoming.id);

  if (existing) {
    return stages.map(stage =>
      stage.id === incoming.id
        ? {
            // overwrite scalar fields from incoming
            ...incoming,

            // preserve hydrated relations
            scores: stage.scores ?? [],
            chart_pools: stage.chart_pools ?? [],

            // hydrate charts only if chart_id exists
            charts:
              incoming.chart_id != null
                ? stage.chart_pools?.find(pool => pool.chart_id === incoming.chart_id)?.charts ?? null
                : null,
          }
        : stage
    );
  }

  // INSERT (new stage from realtime)
  return [
    ...stages,
    {
      ...incoming,
      scores: [],
      chart_pools: [],
      charts: null,
    }
  ];
}

// Used by RealTime updates on RoundPage
export function deleteStage(
  stages: Stage[],
  stageId: number
): Stage[] {
  return stages.filter(stage => stage.id !== stageId);
}

export function upsertChartPoolInStages(
  stages: Stage[],
  incoming: ChartPool
): Stage[] {
  return stages.map(stage => {
    if (stage.id !== incoming.stage_id) return stage;

    // hydrate with charts data
    const chart = getChartById(chartsData, incoming.chart_id);
    const hydratedIncoming = chart ? { ...incoming, charts: chart } : incoming;

    const pool = stage.chart_pools ?? [];
    const nextPool = pool.some(p => Number(p.id) === Number(hydratedIncoming.id))
        ? pool.map(p =>
            Number(p.id) === Number(hydratedIncoming.id)
                ? { ...p, ...hydratedIncoming }
                : p
            )
        : [...pool, hydratedIncoming];

        return {
        ...stage,
        chart_pools: nextPool,
        // Update stage.charts if its chart_id matches the incoming one
        charts:
            stage.chart_id === hydratedIncoming.chart_id
            ? hydratedIncoming.charts ?? stage.charts
            : stage.charts,
        // Keep existing scores intact
        scores: stage.scores ?? [],
        };
  });
}

export function deleteChartPoolFromStages(
  stages: Stage[],
  poolId: number
): Stage[] {
  return stages.map(stage => {
    const pool = stage.chart_pools ?? [];
    const removed = pool.find(p => p.id === poolId);

    if (!removed) return stage;

    return {
      ...stage,
      chart_pools: pool.filter(p => p.id !== poolId),
      charts:
        stage.chart_id === removed.chart_id
          ? null
          : stage.charts,
    };
  });
}

// necessary because TS is not smart enough to infer types from JSON imports
function getChartById(
  chartsData: any[],
  chartId: number | null | undefined
): Chart | null {
  if (chartId == null) return null;

  const raw = chartsData.find(c => Number(c.id) === chartId);
  if (!raw) return null;

  return {
    id: Number(raw.id),
    name_en: raw.name_en,
    name_kr: raw.name_kr ?? null,
    level: Number(raw.level),
    type: raw.type,
    image_url: raw.image_url ?? null,
    created_at: raw.created_at,
  };
}