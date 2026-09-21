import { synthesizeSnapshotChart } from "./chartSnapshot";

import type { Chart } from "../types/Chart";
import type { ChartPool } from "../types/ChartPool";
import type { ChartSnapshotColumns, SnapshotChart } from "./chartSnapshot";

type PoolChartSource = ChartSnapshotColumns & Pick<ChartPool, "id" | "charts" | "created_at">;

/**
 * The chart a pool entry represents, however it was recorded - mirrors
 * getStageChart() for the same reason: callers shouldn't care whether a
 * candidate points at a `charts` row or describes itself inline.
 */
export function getPoolChart(pool: PoolChartSource | null | undefined): Chart | SnapshotChart | null {
  if (!pool) return null;
  if (pool.charts) return pool.charts;
  return synthesizeSnapshotChart(-pool.id, pool, pool.created_at);
}

/** True when this pool entry came from outside this app. */
export function isImportedPoolChart(pool: PoolChartSource | null | undefined) {
  return !!pool && !pool.charts && !!pool.chart_name;
}
