import { supabaseClient } from "../lib/supabaseClient";

export async function handleDeleteChartFromPool(stageId: number, chartId: number) {
  const { data, error } = await supabaseClient
    .from("chart_pools")
    .delete()
    .eq("stage_id", stageId)
    .eq("chart_id", chartId)
    .select()
    .single();

  if (error) {
    console.error("Error deleting chart from pool:", error.message);
    return null;
  }

  return data;
}