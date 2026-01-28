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