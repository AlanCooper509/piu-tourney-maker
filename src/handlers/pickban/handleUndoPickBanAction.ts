import { supabaseClient } from "../../lib/supabaseClient";

export interface HandleUndoPickBanActionParams {
  sequence: number;
  roundId: number;
  groupId?: number | null;
}

export async function handleUndoPickBanAction({
  sequence,
  roundId,
  groupId
}: HandleUndoPickBanActionParams): Promise<number> {

  // 1. Start building the query with the inner join selection
  let query = supabaseClient
    .from("pickban_logs")
    .select(`
      chartdraw_entries_id,
      chartdraw_entries!inner(round_id, group)
    `)
    .eq("sequence", sequence)
    .eq("chartdraw_entries.round_id", roundId);

  // 2. Conditionally apply the group filter if provided
  if (groupId !== undefined && groupId !== null) {
    query = query.eq("chartdraw_entries.group", groupId);
  }

  const { data: logData, error: logFetchError } = await query.maybeSingle();

  if (logFetchError) {
    throw logFetchError;
  }

  if (!logData) {
    const groupContext = groupId ? ` and group ${groupId}` : "";
    throw new Error(`Could not find a log entry for step ${sequence} in round ${roundId}${groupContext}.`);
  }

  const targetEntryId = logData.chartdraw_entries_id;

  // 3. Clear out the target chart slot
  const entryUpdatePromise = supabaseClient
    .from("chartdraw_entries")
    .update({
      action: null,
      player_round_id: null,
      play_order: null
    })
    .eq("id", targetEntryId);

  // 4. Wipe out the log history tracking row
  const logDeletePromise = supabaseClient
    .from("pickban_logs")
    .delete()
    .eq("chartdraw_entries_id", targetEntryId)
    .eq("sequence", sequence);

  // 5. Fire parallel executions
  const [entryResult, logResult] = await Promise.all([
    entryUpdatePromise,
    logDeletePromise,
  ]);

  if (entryResult.error) throw entryResult.error;
  if (logResult.error) throw logResult.error;

  return Number(targetEntryId);
}