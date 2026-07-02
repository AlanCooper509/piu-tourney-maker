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
  created_at: string;             // ISO timestamp string
}