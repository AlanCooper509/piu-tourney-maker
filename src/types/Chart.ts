export type ChartType = 'Single' | 'Double' | 'Co-Op' | 'UCS';
export interface Chart {
  id: number;               // bigint -> number
  name_en: string;          // text
  name_kr?: string;   // text
  level: number;            // bigint -> number
  type?: ChartType;   // enum type
  image_url?: string; // text
  created_at: string;       // ISO date string (yyyy-mm-dd)
}
