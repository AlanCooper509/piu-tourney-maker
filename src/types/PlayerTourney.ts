export interface PlayerTourney {
  id: number;              // bigint -> number
  player_name: string;     // text
  tourney_id: number;      // bigint -> number
  seed: number | null;     // bigint -> number
  created_at: string;      // ISO timestamp string
}