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