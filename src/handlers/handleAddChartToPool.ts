import { supabaseClient } from "../lib/supabaseClient";

interface ChartQuery {
  name: string;
  level: number;
  type: 'Single' | 'Double' | 'Co-Op' | 'UCS';
}

/**
 * Adds a chart to a stage's chart pool based on chart query.
 * @param stageId ID of the stage
 * @param query Object containing name, level, and type of the chart
 * @returns The inserted chart_pools row with chart details
 */
export async function handleAddChartToPool(stageId: number, query: ChartQuery) {
  // 1. Look up the chart by name, level, type
  const { data: chart, error: chartError } = await supabaseClient
    .from('charts')
    .select('id')
    .eq('name_en', query.name)
    .eq('level', query.level)
    .eq('type', query.type)
    .limit(1)
    .single();

  if (chartError) throw chartError;
  if (!chart) throw new Error(`Chart not found for "${query.name}" (Level ${query.level}, Type ${query.type})`);

  // 2. Insert into chart_pools and return with related chart
  const { data: inserted, error: insertError } = await supabaseClient
    .from('chart_pools')
    .insert([{ stage_id: stageId, chart_id: chart.id }])
    .select(`*, charts (*)`)
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      throw new Error(`This chart is already in the pool for this stage.`);
    }
    throw insertError;
  }

  return inserted;
}