import { supabaseClient } from "../../lib/supabaseClient";

/**
 * Takes the tourney off stream: clears which round is live and that round's
 * pushed heat/lanes, so OBS sources fall back to their placeholders.
 */
export async function handleStopBroadcast(tourneyId: number, roundId: number | null) {
  // 1. Stop pointing OBS at any round
  const { error: tourneyError } = await supabaseClient
    .from("tourneys")
    .update({ stream_round_id: null })
    .eq("id", tourneyId);

  if (tourneyError) {
    console.error("Failed to clear tourney stream round target:", tourneyError.message);
    return;
  }

  if (roundId == null) return;

  // 2. Clear the previously live round's heat/lanes state
  const { error: roundError } = await supabaseClient
    .from("rounds")
    .update({ active_stream_state: null })
    .eq("id", roundId);

  if (roundError) {
    console.error("Failed to clear active broadcast state:", roundError.message);
  }
}
