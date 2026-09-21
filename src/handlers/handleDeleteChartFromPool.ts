import { supabaseClient } from "../lib/supabaseClient";

export async function handleDeleteChartFromPool(poolId: number) {
  const { data, error } = await supabaseClient
    .from("chart_pools")
    .delete()
    .eq("id", poolId)
    .select()
    .single();

  if (error) {
    console.error("Error deleting chart from pool:", error.message);
    return null;
  }

  return data;
}