export type RoundStatus = 'Not Started' | 'In Progress' | 'Complete';
export interface Round {
  id: number;                        // bigint -> number
  tourney_id: number;                // bigint -> number
  created_at: string;                // ISO timestamp string
  name: string;                      // text
  players_advancing: number;         // bigint -> number
  points_per_stage?: string;         // text
  status: RoundStatus | null;        // enum type
  next_round_id?: number;            // bigint -> number
  parent_round_id?: number;          // bigint -> number
}