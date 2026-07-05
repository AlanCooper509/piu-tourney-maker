import type { PickbanAction } from "./Pickban";

export interface PickbanLog {
  id: number;                          // bigint -> number
  player_round_id: number | null;      // bigint null -> number | null (null for 'Automation')
  action: PickbanAction;               // public.chartdraw_actions enum -> PickbanAction
  sequence: number;                    // bigint -> number
  created_at: string;                  // timestamp with time zone
  chartdraw_entries_id: number;        // bigint -> number
}