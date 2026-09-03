import { supabaseClient } from "../../lib/supabaseClient";
import type { Round } from "../../types/Round";

export async function handlePushBroadcast(
  round: Round,
  heatNum: number,
  lanes: number[],
  reverse: boolean = false
) {
  // 1. Update active heat/lanes state on the selected round
  const { error: roundError } = await supabaseClient
    .from("rounds")
    .update({
      active_stream_state: {
        heat: heatNum,
        lanes: lanes,
        reverse_order: reverse,
      },
    })
    .eq("id", round.id);

  if (roundError) {
    console.error("Failed to update active broadcast state:", roundError.message);
    return;
  }

  // 2. Point tourney.stream_round_id to this round so OBS updates automatically
  const { error: tourneyError } = await supabaseClient
    .from("tourneys")
    .update({
      stream_round_id: round.id,
    })
    .eq("id", round.tourney_id);

  if (tourneyError) {
    console.error("Failed to update tourney stream round target:", tourneyError.message);
  }
}