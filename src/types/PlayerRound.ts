export interface PlayerRound {
  id: number;                // bigint -> number
  round_id: number;          // bigint -> number
  player_tourney_id: number; // bigint -> number
  created_at: string;        // ISO timestamp string
  player_tourneys: {
    player_name: string;     // text; NOTE: MUST be using SELECT clause of *, player_tourneys(player_name) when fetching
  };
}