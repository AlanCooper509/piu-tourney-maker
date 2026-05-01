export type RoundStatus = 'Not Started' | 'In Progress' | 'Complete';
export interface Round {
  id: number;                        // bigint -> number
  tourney_id: number;                // bigint -> number
  name: string;                      // text
  players_advancing: number;         // bigint -> number
  status: RoundStatus | null;        // enum type
  next_round_id?: number;            // bigint -> number
  lost_next_round_id?: number;       // bigint -> number
  parent_round_id?: number;          // bigint -> number
  round_pool_id?: number;            // bigint -> number
  points_per_stage?: string;         // text
  created_at: string;                // ISO timestamp string 
}