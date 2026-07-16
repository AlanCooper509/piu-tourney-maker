export interface PlayerRound {
  id: number;                // bigint -> number
  round_id: number;          // bigint -> number
  player_tourney_id: number; // bigint -> number
  sort_order: number;        // bigint -> number
  created_at: string;        // ISO timestamp string
  player_tourneys: {         // NOTE: MUST be using SELECT clause of *, player_tourneys(player_name, seed) when fetching
    player_name: string;     // text; 
    seed: number | null;     // bigint -> number | null
  };
}