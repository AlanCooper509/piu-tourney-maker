import type { Chart } from "./Chart";
import type { PickbanAction } from "./Pickban";
import type { PlayerRound } from "./PlayerRound";

export interface ChartdrawEntry {
  id: number;                            // bigint -> number
  round_id: number;                      // bigint -> number
  chart_id: number | null;               // bigint -> number | null
  player_round_id: number | null;        // bigint -> number | null
  action: PickbanAction | null;          // custom enum
  order: number;                         // bigint -> number | null
  group: number | null;                  // bigint -> number | null
  created_at: string;                    // timestamp with time zone -> ISO string
}

export interface ChartdrawEntryWithDetails extends ChartdrawEntry {
  charts?: Chart | null;
  player_rounds?: (PlayerRound & {
    player_tourneys: {
      player_name: string;
    } | null;
  }) | null;
}