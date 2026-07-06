import { supabaseClient } from "../../lib/supabaseClient";

export async function handleResetChartDrawForRound(roundId: number) {
  if (!roundId) throw new Error("Round ID is required");

  // 1. Fetch current round status to ensure it's not completed
  const { data: roundData, error: roundError } = await supabaseClient
    .from("rounds")
    .select("status")
    .eq("id", roundId)
    .single();

  if (roundError || !roundData) {
    throw roundError || new Error("Round not found.");
  }

  // 2. Fail execution if the round is already complete
  if (roundData.status === "Complete") {
    throw new Error("Completed rounds cannot be reset.");
  }

  // 3. Proceed with deleting the chart draw entries
  const { data, error: deleteError } = await supabaseClient
    .from("chartdraw_entries")
    .delete()
    .eq("round_id", roundId)
    .select();

  if (deleteError) {
    console.error("Error deleting chart entries:", deleteError.message);
    throw new Error(`Failed to remove chart entries: ${deleteError.message}`);
  }

  // 4. Reset the round status back to "Not Started" since deletion succeeded
  const { error: statusUpdateError } = await supabaseClient
    .from("rounds")
    .update({ status: "Not Started" })
    .eq("id", roundId);

  if (statusUpdateError) {
    // "soft error": chart draws deleted but round status not reset 
    console.error("Failed to reset round status to Not Started:", statusUpdateError.message);
  }

  return data;
}