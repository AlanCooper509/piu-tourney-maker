export type RoundStatus = 'Not Started' | 'In Progress' | 'Complete';
export interface Round {
  id: number;                        // bigint -> number
  tourney_id: number;                // bigint -> number
  previous_round_id?: number | null; // bigint -> number
  created_at: string;                // ISO timestamp string
  name: string;                      // text
  players_advancing: number;         // bigint -> number
  status: RoundStatus | null;        // enum type
}