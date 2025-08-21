import type { Chart } from "./Chart";

export interface ChartPool {
  id: number;               // bigint -> number
  stage_id: number;         // bigint -> number
  chart_id: number;         // bigint -> number
  created_at: string;       // ISO timestamp string
  charts: Chart | null;
}
