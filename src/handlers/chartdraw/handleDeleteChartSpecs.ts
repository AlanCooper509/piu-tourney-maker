import { supabaseClient } from "../../lib/supabaseClient";

export async function handleDeleteChartSpecs(chartdrawConfigSpecsId: number) {
  const { data, error } = await supabaseClient
    .from("chartdraw_config_specs")
    .delete()
    .eq("id", chartdrawConfigSpecsId)
    .select()
    .single();

  if (error) {
    console.error("Error deleting chart specification:", error.message);
    throw new Error(`Failed to remove chart specification: ${error.message}`);
  }

  return data;
}