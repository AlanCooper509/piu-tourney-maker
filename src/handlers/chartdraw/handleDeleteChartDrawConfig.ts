import { supabaseClient } from "../../lib/supabaseClient";

export async function handleDeleteChartDrawConfig(chartdrawConfigId: number) {
  const { data, error } = await supabaseClient
    .from("chartdraw_configs")
    .delete()
    .eq("id", chartdrawConfigId)
    .select()
    .single();

  if (error) {
    console.error("Error deleting chartdraw config (ruleset):", error.message);
    throw new Error(`Failed to remove chartdraw config (ruleset): ${error.message}`);
  }

  return data;
}