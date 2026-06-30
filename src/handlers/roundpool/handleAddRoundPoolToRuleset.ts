import { supabaseClient } from "../../lib/supabaseClient";

export async function handleAddRoundPoolToRuleset(roundPoolId: number, chartdrawConfigId: number) {
  const { data, error } = await supabaseClient
    .from("round_pools")
    .update({ chartdraw_config_id: chartdrawConfigId })
    .eq("id", roundPoolId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Round pool not found or permission denied.");
  }

  return data;
}