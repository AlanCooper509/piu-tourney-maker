import { supabaseClient } from "../../lib/supabaseClient";
import type { Round } from "../../types/Round";

export async function handlePushBroadcast (
  round: Round,
  heatNum: number,
  lanes: number[],
  reverse: boolean = false
) {
  const { error } = await supabaseClient
    .from("rounds")
    .update({
      active_stream_state: {
        heat: heatNum,
        lanes: lanes,
        reverse_order: reverse,
      },
    })
    .eq("id", round.id);

  if (error) {
    console.error("Failed to update active broadcast state:", error.message);
  }
};