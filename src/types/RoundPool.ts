export interface RoundPool {
  id: number;                   // bigint -> number
  tourney_id: number;           // bigint -> number
  name: string;                 // text
  sort_order: number;           // bigint -> number
  chartdraw_config_id: number;  // bigint -> number
  created_at: string;           // ISO timestamp string
}