import type { Chart } from "../types/Chart";
import type { ChartType } from "../types/ChartType";
import type { ChartQuery } from "../types/ChartQuery";
import type { StageChartMeta } from "../types/Stage";

/**
 * A Chart synthesized from a row's inline snapshot columns rather than read
 * from `charts`. Structurally still a Chart, so existing card/row components
 * need no changes, but callers that want the source's own type label can
 * check for `sourceTypeLabel` instead of assuming every Chart might have one.
 */
export interface SnapshotChart extends Chart {
  /**
   * Type/class exactly as the source labelled it (e.g. "ESP", "hard+").
   * Prefer this over `type` for display, since `type` can only express this
   * app's four PIU values.
   */
  sourceTypeLabel: string | null;
}

/** The inline snapshot columns shared by stages and chart_pools rows. */
export interface ChartSnapshotColumns {
  chart_name?: string | null;
  chart_type?: string | null;
  chart_level?: number | null;
  chart_image_url?: string | null;
}

/**
 * Builds a synthetic Chart from a row's inline snapshot columns, or null if
 * the row doesn't describe one inline (i.e. it points at a real `charts` row
 * instead, or describes nothing yet).
 *
 * `sourceId` should be negative and unique to the owning row (e.g. -stage.id
 * or -poolRow.id) so it can never collide with a real `charts.id` - nothing
 * joins on it, and a real id would invite code to look it up and find nothing.
 */
export function synthesizeSnapshotChart(
  sourceId: number,
  snapshot: ChartSnapshotColumns,
  createdAt: string
): SnapshotChart | null {
  if (!snapshot.chart_name) return null;

  return {
    id: sourceId,
    name_en: snapshot.chart_name,
    name_kr: null,
    level: snapshot.chart_level ?? 0,
    type: piuChartTypeForLabel(snapshot.chart_type),
    duration: null,
    image_url: snapshot.chart_image_url ?? null,
    game_id: 0,
    created_at: createdAt,
    sourceTypeLabel: snapshot.chart_type ?? null,
  };
}

/**
 * Best-effort mapping of a source's chart type/class label onto our PIU
 * chart_types enum, which exists mainly to pick a display color. Labels from
 * other games have no equivalent and stay null, which reads as neutral rather
 * than wrong.
 */
function piuChartTypeForLabel(label: string | null | undefined): ChartType | null {
  if (!label) return null;
  const upper = label.toUpperCase();
  if (upper === "S") return "Single";
  if (upper === "D") return "Double";
  if (upper.startsWith("COOP")) return "Co-Op";
  if (upper === "UCS") return "UCS";
  return null;
}

/** True when this chart's type/class came from a source label, not our closed PIU enum. */
export function hasSourceTypeLabel(chart: Chart | SnapshotChart | null | undefined): boolean {
  return !!(chart && "sourceTypeLabel" in chart && chart.sourceTypeLabel);
}

/** Short type/class label for dense displays, from either chart shape. */
export function chartTypeLabel(chart: Chart | SnapshotChart | null | undefined): string {
  if (!chart) return "";
  if (hasSourceTypeLabel(chart)) return (chart as SnapshotChart).sourceTypeLabel!;
  return chart.type?.charAt(0) ?? "";
}

type SmxChartQuery = Extract<ChartQuery, { kind: "smx" }>;

/**
 * Builds the `source: 'snapshot'` insert params for an SMX chart query.
 * handleAddStageToRound and handleAddChartToPool both accept this exact
 * shape, so callers building either a stage or a chart_pools row from an SMX
 * ChartQuery can share this instead of re-deriving diffClass/meta by hand.
 */
export function smxChartQueryToSnapshotParams(chartQuery: SmxChartQuery) {
  return {
    source: "snapshot" as const,
    chart_source: "smx-reference",
    name: chartQuery.name,
    diffClass: chartQuery.diffClass + (chartQuery.flags.includes("plus") ? "+" : ""),
    level: chartQuery.level,
    image_url: chartQuery.image_url,
    meta: {
      game: "smx",
      style: chartQuery.style,
      diffClass: chartQuery.diffClass,
      flags: chartQuery.flags,
      artist: chartQuery.artist,
      bpm: chartQuery.bpm,
    } satisfies StageChartMeta,
  };
}

const SMX_DIFF_CLASS_COLOR: Record<string, string> = {
  beginner: "green",
  easy: "yellow",
  hard: "red",
  wild: "purple",
  dual: "cyan",
  full: "teal",
  team: "pink",
};

const SMX_DIFF_CLASS_ABBR: Record<string, string> = {
  beginner: "B",
  easy: "E",
  hard: "H",
  wild: "W",
  dual: "D",
  full: "F",
  team: "T",
};

/** A folded-in "+" pack marker (e.g. "hard+") doesn't change the difficulty tier. */
const stripPlusMarker = (label: string) => (label.endsWith("+") ? label.slice(0, -1) : label);

export function smxDiffClassColor(label: string | null | undefined): string | null {
  if (!label) return null;
  return SMX_DIFF_CLASS_COLOR[stripPlusMarker(label).toLowerCase()] ?? null;
}

/** Single-letter abbreviation for an SMX diffClass, unchanged if unrecognized. */
export function smxDiffClassAbbr(diffClass: string): string {
  return SMX_DIFF_CLASS_ABBR[diffClass.toLowerCase()] ?? diffClass;
}

/**
 * Badge/tag content for a chart. An SMX chart gets the same compact
 * "<letter><level>[+]" form as the add-chart dropdown (e.g. "H21+"), since
 * its badge is already colored by difficulty. Any other snapshot chart (e.g.
 * an imported non-SMX game, with no color mapping) falls back to
 * "<label> <level>" so it isn't shown unlabelled. A real PIU chart (no
 * source label at all) is just the bare level, as today.
 */
export function chartBadgeLabel(
  chart: Chart | SnapshotChart | null | undefined,
  level: number | string
): string | number {
  if (!hasSourceTypeLabel(chart)) return level;
  const label = chartTypeLabel(chart);
  if (!smxDiffClassColor(label)) return `${label} ${level}`;

  const hasPlus = label.endsWith("+");
  return `${smxDiffClassAbbr(stripPlusMarker(label))}${level}${hasPlus ? "+" : ""}`;
}
