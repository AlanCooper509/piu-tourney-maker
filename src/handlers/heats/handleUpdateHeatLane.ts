import { supabaseClient } from "../../lib/supabaseClient";

export async function handleUpdateHeatLane(
  playerRoundId: number,
  newHeat: number | null,
  newLane: number | null
) {
  const { error } = await supabaseClient
    .from("player_rounds")
    .update({ heat: newHeat, lane: newLane })
    .eq("id", playerRoundId);

  if (error) {
    console.error("Failed to update heat/lane assignment:", error.message);
  }
};
