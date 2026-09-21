import { supabaseClient } from "../lib/supabaseClient";

import type { StageChartMeta } from "../types/Stage";

type ChartPoolQuery =
  | {
      source: 'db';
      name: string;
      level: number;
      type: 'Single' | 'Double' | 'Co-Op' | 'UCS';
    }
  | {
      source: 'snapshot';
      chart_source: string;
      name: string;
      diffClass: string;
      level: number;
      image_url: string | null;
      meta?: StageChartMeta;
    };

/**
 * Adds a chart to a stage's chart pool.
 * @param stageId ID of the stage
 * @param query Either a lookup against the backend `charts` table, or a
 *   chart described inline (no backend row to look up) - see getPoolChart()
 *   for the read side.
 * @returns The inserted chart_pools row with chart details
 */
export async function handleAddChartToPool(stageId: number, query: ChartPoolQuery) {
  if (query.source === 'snapshot') {
    const { data: inserted, error: insertError } = await supabaseClient
      .from('chart_pools')
      .insert([
        {
          stage_id: stageId,
          chart_id: null,
          chart_source: query.chart_source,
          chart_name: query.name,
          chart_type: query.diffClass,
          chart_level: query.level,
          chart_image_url: query.image_url,
          chart_meta: query.meta ?? null,
        },
      ])
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