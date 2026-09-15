export type RoundStatus = 'Not Started' | 'Pick Ban' | 'Ready' | 'In Progress' | 'Complete';

export interface StreamState {
  heat: number;
  lanes: number[];
  reverse_order?: boolean;
}

export interface Round {
  id: number;                               // bigint -> number
  tourney_id: number;                       // bigint -> number
  name: string;                             // text
  status: RoundStatus | null;               // enum type
  active_stream_state?: StreamState | null; // jsonb -> StreamState | null
  round_pool_id?: number;                   // bigint -> number
  points_per_stage?: string;                // text
  created_at: string;                       // ISO timestamp string
}