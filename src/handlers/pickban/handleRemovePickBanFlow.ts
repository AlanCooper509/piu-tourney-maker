import { supabaseClient } from "../../lib/supabaseClient";

export async function handleRemovePickBanFlow(chartdrawConfigId: number) {
  const { data, error } = await supabaseClient
    .from("chartdraw_configs")
    .update({ pickban_ruleset_id: null })
    .eq("id", chartdrawConfigId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Configuration not found or you do not have administrative permissions to modify it."
    );
  }

  return data;
}