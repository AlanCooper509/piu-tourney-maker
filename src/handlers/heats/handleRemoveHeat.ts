import { supabaseClient } from "../../lib/supabaseClient";

export async function handleRemoveHeat(
  heatNumToRemove: number,
  assignedPlayers: { id: number; heat: number | null; lane: number | null }[],
  setTargetHeatCount: React.Dispatch<React.SetStateAction<number>>
) {
  const playersInHeat = assignedPlayers.filter(
    (p) => Number(p.heat) === heatNumToRemove
  );

  if (playersInHeat.length > 0) {
    const idsToReset = playersInHeat.map((p) => p.id);
    const { error } = await supabaseClient
      .from("player_rounds")
      .update({ heat: null, lane: null })
      .in("id", idsToReset);

    if (error) {
      console.error("Failed to unassign players from heat:", error.message);
    }
  }

  setTargetHeatCount((prev) => Math.max(1, prev - 1));
};
