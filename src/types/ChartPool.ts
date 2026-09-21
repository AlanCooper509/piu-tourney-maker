import type { Chart } from "./Chart";
import type { StageChartMeta } from "./Stage";

export interface ChartPool {
  id: number;               // bigint -> number
  stage_id: number;         // bigint -> number
  chart_id?: number | null; // bigint -> number
  difficulties: Text;       // JSON string representing an array of difficulty levels
  created_at: string;       // ISO timestamp string
  charts: Chart | null;

  // A candidate chosen from outside this app's `charts` table describes
  // itself here instead. Read these through getPoolChart(), never directly -
  // mirrors Stage's own chart_source/chart_name/... columns.
  chart_source?: string | null;
  chart_name?: string | null;
  chart_type?: string | null;
  chart_level?: number | null;
  chart_image_url?: string | null;
  chart_meta?: StageChartMeta | null;
}
