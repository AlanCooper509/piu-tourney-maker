import { supabaseClient } from "../../lib/supabaseClient";

export async function handleLinkPickBanFlow(chartdrawConfigId: number, rulesetId: number) {
  const { data, error } = await supabaseClient
    .from("chartdraw_configs")
    .update({ pickban_ruleset_id: rulesetId })
    .eq("id", chartdrawConfigId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Configuration not found or permission denied.");
  }

  return data;
}