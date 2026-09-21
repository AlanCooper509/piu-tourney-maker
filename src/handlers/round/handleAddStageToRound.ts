import { supabaseClient } from "../../lib/supabaseClient";

import type { StageChartMeta } from "../../types/Stage";

type ChartParams =
  | {
      source: 'db';
      name: string;
      level: number;
      type: 'Single' | 'Double' | 'Co-Op' | 'UCS';
      game_id: number;
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

export async function handleAddStageToRound(
  roundId: number,
  chartParams?: ChartParams
) {
  // A chart described inline (no backend `charts` row to look up) skips
  // straight to the insert - see getStageChart() for the read side.
  if (chartParams?.source === 'snapshot') {
    const { data, error } = await supabaseClient
      .from("stages")
      .insert([
        {
          round_id: roundId,
          chart_id: null,
          chart_source: chartParams.chart_source,
          chart_name: chartParams.name,
          chart_type: chartParams.diffClass,
          chart_level: chartParams.level,
          chart_image_url: chartParams.image_url,
          chart_meta: chartParams.meta ?? null,
        },
      ])
      .select(`
        *,
        charts (*)
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`Stage already exists in this round.`);
      }
      throw error;
    }

    return data;
  }

  let chartId: number | null = null;

  // If chart params are provided, fetch the matching chart record
  if (chartParams) {
    const { data: chartData, error: chartError } = await supabaseClient
      .from("charts")
      .select("id")
      .eq("name_en", chartParams.name)
      .eq("level", chartParams.level)
      .eq("type", chartParams.type)
      .eq("game_id", chartParams.game_id)
      .limit(1);

    if (chartError) {
      throw new Error(`Database error finding chart: ${chartError.message}`);
    }
    if (!chartData || !chartData.length) {
      throw new Error(
        `The chart "${chartParams.name}" [${chartParams.type} ${chartParams.level}] was not found in the database.`
      );
    }
    chartId = chartData[0].id;
  }


  const { data, error } = await supabaseClient
    .from("stages")
    .insert([
      {
        round_id: roundId,
        chart_id: chartId, // null if chartParams was not provided
      },
    ])
    .select(`
      *,
      charts (*)
    `)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Stage already exists in this round.`);
    }
    throw error;
  }

  return data;
}
