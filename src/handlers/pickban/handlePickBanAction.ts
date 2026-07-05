import { supabaseClient } from "../../lib/supabaseClient";
import type { PickbanAction } from "../../types/Pickban";
import type { PickbanLog } from "../../types/PickbanLog";

export interface HandlePickBanActionParams {
  playerRoundId: number | null;
  action: PickbanAction;
  sequence: number;
  chartdrawEntriesId: number;
  playOrder: number | null;
}

export async function handlePickBanAction({
  chartdrawEntriesId,
  playerRoundId,
  action,
  sequence,
  playOrder,
}: HandlePickBanActionParams): Promise<PickbanLog> {
  
  const logInsertPromise = supabaseClient
    .from("pickban_logs")
    .insert({
      chartdraw_entries_id: chartdrawEntriesId,
      player_round_id: playerRoundId,
      action: action,
      sequence: sequence,
    })
    .select()
    .single();

  const entryUpdatePromise = supabaseClient
    .from("chartdraw_entries")
    .update({
      action: action,
      player_round_id: playerRoundId,
      play_order: playOrder
    })
    .eq("id", chartdrawEntriesId);

  const [logResult, entryResult] = await Promise.all([
    logInsertPromise,
    entryUpdatePromise,
  ]);

  if (logResult.error) throw logResult.error;
  if (entryResult.error) throw entryResult.error;

  return logResult.data;
}