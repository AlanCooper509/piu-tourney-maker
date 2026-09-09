import type { Chart } from "./Chart";
import type { ChartPool } from "./ChartPool";
import type { Score } from "./Score";

export interface Stage {
  id: number;                 // bigint -> number
  round_id: number;           // bigint -> number
  chart_id?: number | null;   // bigint -> number
  play_order?: number | null; // bigint -> number
  created_at: string;         // ISO timestamp string
  chart_pools?: ChartPool[];
  charts?: Chart | null;
  scores?: Score[];

  // A chart chosen outside this app describes itself here instead of pointing
  // at a `charts` row. Read these through getStageChart(), never directly.
  chart_source?: string | null;      // text, e.g. 'ddrtools'
  chart_name?: string | null;        // text
  chart_difficulty?: string | null;  // text, free-form so non-Pump games fit
  chart_level?: number | null;       // bigint -> number
  chart_image_url?: string | null;   // text
  chart_meta?: StageChartMeta | null; // jsonb
}

/** Whatever else the source knew, kept rather than discarded. */
export interface StageChartMeta {
  artist?: string;
  bpm?: string;
  /** the source's own name for the game, e.g. "pump-phoenix_2" */
  game?: string;
  /** ids that let a stage be traced back to where it came from */
  sourceRoom?: string;
  sourceDrawingId?: string;
  sourceChartId?: string;
  [key: string]: unknown;
}