import { supabaseClient } from "../../lib/supabaseClient";
import type { ChartType } from "../../types/ChartType";

export async function handleAddChartSpecs(
  configId: number,
  chartType: ChartType,
  minLevel: number,
  maxLevel: number,
  quantity: number,
  group: number | null
) {
  const MAX_LEVEL_CONSTRAINTS: Record<string, number> = {
    Single: 26,
    Double: 29,
    "Co-Op": 5,
  };

  const constraint = MAX_LEVEL_CONSTRAINTS[chartType];
  if (constraint && maxLevel > constraint) {
    throw new Error(`Maximum for ${chartType} cannot exceed ${constraint}.`);
  }

  if (chartType === "Co-Op" && minLevel < 2) {
    throw new Error("No 1x Co-Op charts.");
  }

  const { data, error } = await supabaseClient
    .from("chartdraw_config_specs")
    .insert({
      chartdraw_config_id: configId,
      chart_type: chartType,
      level_min: minLevel,
      level_max: maxLevel,
      quantity: quantity,
      group: group || null,
    })
    .select();

  if (error) {
    if (error.code === "23505") {
      throw new Error("These specifications already exist in this configuration.");
    }
    throw error;
  }

  return data;
}