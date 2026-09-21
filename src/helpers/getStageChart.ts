import { synthesizeSnapshotChart, chartTypeLabel, chartBadgeLabel, smxDiffClassColor } from "./chartSnapshot";

import type { Chart } from "../types/Chart";
import type { Stage } from "../types/Stage";
import type { SnapshotChart } from "./chartSnapshot";

export type { SnapshotChart } from "./chartSnapshot";
export { chartTypeLabel, chartBadgeLabel, smxDiffClassColor };

/**
 * The chart a stage was played on, however it was recorded.
 *
 * A stage either points at a `charts` row (chosen here) or describes its chart
 * inline (chosen somewhere else and imported). Callers shouldn't care which, so
 * this returns one shape either way — a snapshot is presented as a synthetic
 * Chart so the existing card and row components need no changes.
 */
export function getStageChart(stage: Stage | null | undefined): Chart | SnapshotChart | null {
  if (!stage) return null;
  if (stage.charts) return stage.charts;
  return synthesizeSnapshotChart(-stage.id, stage, stage.created_at);
}

/** True when this stage's chart came from outside this app. */
export function isImportedChart(stage: Stage | null | undefined) {
  return !!stage && !stage.charts && !!stage.chart_name;
}
