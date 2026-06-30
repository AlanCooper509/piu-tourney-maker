import { supabaseClient } from "../../lib/supabaseClient";

export async function handleRemoveRoundPoolFromRuleset(roundPoolId: number) {
  const { data, error } = await supabaseClient
    .from("round_pools")
    .update({ chartdraw_config_id: null })
    .eq("id", roundPoolId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Round pool not found or you do not have administrative permissions to modify it."
    );
  }

  return data;
}