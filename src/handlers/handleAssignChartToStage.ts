import { supabaseClient } from "../lib/supabaseClient";

import type { ChartPool } from "../types/ChartPool";

const STAGE_SELECT = "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)";

/**
 * Assigns a specific `charts` row to a stage by id. Explicitly clears the
 * snapshot columns too, so reassigning a stage away from a snapshot chart
 * doesn't leave it violating the chart_id-xor-snapshot constraint.
 */
export async function handleAssignChartToStage(stageId: number, chosenChartId: number) {
  const { data: updatedStage, error } = await supabaseClient
    .from("stages")
    .update({
      chart_id: chosenChartId,
      chart_source: null,
      chart_name: null,
      chart_type: null,
      chart_level: null,
      chart_image_url: null,
      chart_meta: null,
    })
    .eq("id", stageId)
    .select(STAGE_SELECT);

  if (error) throw error;

  return updatedStage?.[0] ?? null;
}

/**
 * Assigns a pool entry described inline (no backend `charts` row) to a
 * stage, by copying its snapshot columns onto the stage's own.
 */
export async function handleAssignSnapshotPoolEntryToStage(stageId: number, pool: ChartPool) {
  const { data: updatedStage, error } = await supabaseClient
    .from("stages")
    .update({
      chart_id: null,
      chart_source: pool.chart_source,
      chart_name: pool.chart_name,
      chart_type: pool.chart_type,
      chart_level: pool.chart_level,
      chart_image_url: pool.chart_image_url,
      chart_meta: pool.chart_meta,
    })
    .eq("id", stageId)
    .select(STAGE_SELECT);

  if (error) throw error;

  return updatedStage?.[0] ?? null;
}

/** Assigns a pool entry (real or snapshot) to a stage, dispatching by shape. */
export async function assignPoolEntryToStage(stageId: number, pool: ChartPool) {
  return pool.chart_id != null
    ? handleAssignChartToStage(stageId, pool.chart_id)
    : handleAssignSnapshotPoolEntryToStage(stageId, pool);
}

/**
 * Assigns a random chart from the stage's chart_pools to the stage.
 */
export async function handleAssignRandomChartToStage(stageId: number) {
  // 1. Get all chart_pools for stage
  const { data: chartPools, error } = await supabaseClient
    .from("chart_pools")
    .select("*")
    .eq("stage_id", stageId);

  if (error) throw error;
  if (!chartPools || chartPools.length === 0) {
    throw new Error("No chart_pools found for this stage_id");
  }

  // 2. Pick a random entry and assign it
  const randomIndex = Math.floor(Math.random() * chartPools.length);
  return assignPoolEntryToStage(stageId, chartPools[randomIndex]);
}