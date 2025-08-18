import { supabaseClient } from "../lib/supabaseClient";

export async function handleAssignRandomChartToStage(stageId: number) {
  // 1. Get all chart_pools for stage
  const { data: chartPools, error } = await supabaseClient
    .from('chart_pools')
    .select('chart_id')
    .eq('stage_id', stageId);

  if (error) throw error;
  if (!chartPools || chartPools.length === 0) {
    throw new Error('No chart_pools found for this stage_id');
  }

  // 2. Pick a random chart_id
  const randomIndex = Math.floor(Math.random() * chartPools.length);
  const chosenChartId = chartPools[randomIndex].chart_id;

  // 3. Update stages table
  const { data: updatedStage, error: updateError } = await supabaseClient
    .from('stages')
    .update({ chart_id: chosenChartId })
    .eq('id', stageId)
    .select('*, chart_pools(*, charts(*))');

  if (updateError) throw updateError;

  // return the single stage object
  return updatedStage?.[0] ?? null;
}