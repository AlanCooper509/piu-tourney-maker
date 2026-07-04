import { supabaseClient } from "../../lib/supabaseClient";

export async function handleResetChartDrawForRound(roundId: number) {
  const { data, error } = await supabaseClient
    .from("chartdraw_entries")
    .delete()
    .eq("round_id", roundId)
    .select();

  if (error) {
    console.error("Error deleting chart entries:", error.message);
    throw new Error(`Failed to remove chart entries: ${error.message}`);
  }

  return data;
}