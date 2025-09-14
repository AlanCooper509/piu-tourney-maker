import { supabaseClient } from "../lib/supabaseClient";

/**
 * Assigns a specific chart to a stage.
 */
export async function handleAssignChartToStage(stageId: number, chosenChartId: number) {
  const { data: updatedStage, error } = await supabaseClient
    .from("stages")
    .update({ chart_id: chosenChartId })
    .eq("id", stageId)
    .select("*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)");

  if (error) throw error;

  return updatedStage?.[0] ?? null;
}

/**
 * Assigns a random chart from the stage's chart_pools to the stage.
 */
export async function handleAssignRandomChartToStage(stageId: number) {
  // 1. Get all chart_pools for stage
  const { data: chartPools, error } = await supabaseClient
    .from("chart_pools")
    .select("chart_id")
    .eq("stage_id", stageId);

  if (error) throw error;
  if (!chartPools || chartPools.length === 0) {
    throw new Error("No chart_pools found for this stage_id");
  }

  // 2. Pick a random chart_id
  const randomIndex = Math.floor(Math.random() * chartPools.length);
  const chosenChartId = chartPools[randomIndex].chart_id;

  // 3. Reuse assignChartToStage to update
  return handleAssignChartToStage(stageId, chosenChartId);
}