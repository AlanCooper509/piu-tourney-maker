import type { ChartDuration } from "./ChartDuration";
import type { ChartType } from "./ChartType";

export interface Chart {
  id: number;                     // bigint -> number
  name_en: string;                // text
  name_kr: string | null;         // text
  level: number;                  // bigint -> number
  type: ChartType | null;         // enum type
  duration: ChartDuration | null; // enum type
  image_url: string | null;       // text
  game_id: number;                // bigint -> number
  created_at: string;             // ISO timestamp string

  /**
   * Difficulty exactly as an outside source labelled it, for charts that came
   * from one. Present only on charts synthesized by getStageChart(); charts
   * read from the table never set it. Prefer it over `type` when displaying a
   * difficulty, since `type` can only express Pump's four values.
   */
  difficulty_label?: string | null;
}