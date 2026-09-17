import type { Chart } from "../types/Chart";
import type { ChartType } from "../types/ChartType";
import type { Stage } from "../types/Stage";

/**
 * A Chart synthesized from a stage's inline snapshot rather than read from
 * `charts`. Structurally still a Chart, so existing card/row components need
 * no changes, but callers that want the source's own type label can check for
 * `sourceTypeLabel` instead of assuming every Chart might have one.
 */
export interface SnapshotChart extends Chart {
  /**
   * Type/class exactly as the source labelled it (e.g. "ESP"). Prefer this
   * over `type` for display, since `type` can only express this app's four
   * values.
   */
  sourceTypeLabel: string | null;
}

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
  if (!stage.chart_name) return null;

  return {
    // negative id marks this as not being a row in `charts`; nothing joins on
    // it, and a real id would invite code to look it up and find nothing
    id: -stage.id,
    name_en: stage.chart_name,
    name_kr: null,
    level: stage.chart_level ?? 0,
    type: chartTypeForLabel(stage.chart_type),
    duration: null,
    image_url: stage.chart_image_url ?? null,
    game_id: 0,
    created_at: stage.created_at,
    sourceTypeLabel: stage.chart_type ?? null,
  };
}

/** True when this stage's chart came from outside this app. */
export function isImportedChart(stage: Stage | null | undefined) {
  return !!stage && !stage.charts && !!stage.chart_name;
}

/**
 * Best-effort mapping of a source's chart type/class label onto our
 * chart_types enum, which exists mainly to pick a display color. Labels from
 * other games have no equivalent and stay null, which reads as neutral rather
 * than wrong.
 */
function chartTypeForLabel(label: string | null | undefined): ChartType | null {
  if (!label) return null;
  const upper = label.toUpperCase();
  if (upper === "S") return "Single";
  if (upper === "D") return "Double";
  if (upper.startsWith("COOP")) return "Co-Op";
  if (upper === "UCS") return "UCS";
  return null;
}

/** Short type/class label for dense displays, from either chart shape. */
export function chartTypeLabel(chart: Chart | SnapshotChart | null | undefined): string {
  if (!chart) return "";
  if ("sourceTypeLabel" in chart && chart.sourceTypeLabel) return chart.sourceTypeLabel;
  return chart.type?.charAt(0) ?? "";
}
