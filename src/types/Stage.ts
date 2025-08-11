import type { ChartPool } from "./ChartPool";

export interface Stage {
  id: number;                // bigint -> number
  round_id: number;          // bigint -> number
  chart_id?: number | null;  // bigint -> number
  created_at: string;        // ISO timestamp string
  chart_pools?: ChartPool[];
}