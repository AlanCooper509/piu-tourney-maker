import { supabaseClient } from "../../lib/supabaseClient";
import type { PickbanAction } from "../../types/Pickban";
import type { PickbanLog } from "../../types/PickbanLog";

export interface HandlePickBanActionParams {
  playerRoundId: number | null;
  action: PickbanAction;
  sequence: number;
  chartdrawEntriesId: number;
}

export async function handlePickBanAction({
  chartdrawEntriesId,
  playerRoundId,
  action,
  sequence,
}: HandlePickBanActionParams): Promise<PickbanLog> {
  
  // 1. Prepare both queries to run in parallel
  // INSERT pickban_logs query
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

  // UPDATE chartdraw_entries query
  const entryUpdatePromise = supabaseClient
    .from("chartdraw_entries")
    .update({
      action: action,
      player_round_id: playerRoundId,
    })
    .eq("id", chartdrawEntriesId);

  // 2. Await both database requests
  const [logResult, entryResult] = await Promise.all([
    logInsertPromise,
    entryUpdatePromise,
  ]);

  // 3. Catch errors from either database operation
  if (logResult.error) {
    throw logResult.error;
  }
  if (entryResult.error) {
    throw entryResult.error;
  }

  // 4. Return the log data to satisfy UI expectations
  return logResult.data;
}