export interface RoundAdvancement {
  id: number;                    // bigint -> number
  round_id: number;               // bigint -> number
  rank_start: number;             // int
  rank_end?: number | null;       // int, nullable -> open-ended ("this rank and everyone worse")
  destination_round_id: number;   // bigint -> number
  label?: string | null;          // text, nullable
  created_at: string;             // ISO timestamp string
}
