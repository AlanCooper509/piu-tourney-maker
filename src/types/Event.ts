export interface Event {
  id: number;              // bigint -> number
  name: string;            // text
  thumbnail_img?: string;  // text, nullable
  hero_img?: string;       // text, nullable
  location?: string;       // text, nullable
  description?: string;    // text, nullable
  start_date: string;      // ISO timestamp string
  end_date: string;        // ISO timestamp string
  created_at: string;      // ISO timestamp string (default now())
}