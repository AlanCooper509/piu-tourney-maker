import { supabaseClient } from "../../lib/supabaseClient";

interface ChartParams {
  name: string;
  level: number;
  type: 'Single' | 'Double' | 'Co-Op' | 'UCS';
}

export async function handleAddStageToRound(
  roundId: number, 
  chartParams?: ChartParams
) {
  let chartId: number | null = null;

  // If chart params are provided, fetch the matching chart record
  if (chartParams) {
    const { data: chartData, error: chartError } = await supabaseClient
      .from("charts")
      .select("id")
      .eq("name_en", chartParams.name)
      .eq("level", chartParams.level)
      .eq("type", chartParams.type)
      .limit(1); // TODO: temp fix for BITE9 (after adding PHX2 charts, >1 rows returned, just take the first to prevent exception)

    if (chartError) {
      throw new Error(`Database error finding chart: ${chartError.message}`);
    }
    if (!chartData) {
      throw new Error(
        `The chart "${chartParams.name}" [${chartParams.type} ${chartParams.level}] was not found in the database.`
      );
    }
    chartId = chartData.id;
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
