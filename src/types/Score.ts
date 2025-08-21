export interface Score {
  id: number;               // bigint -> number
  stage_id: number;         // bigint -> number
  player_round_id: number;  // bigint -> number
  score?: number | null;    // bigint -> number, nullable
  created_at: string;       // ISO timestamp string
}