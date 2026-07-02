import { supabaseClient } from "../../lib/supabaseClient";
import type { ChartdrawConfigWithSpecs } from "../../types/ChartDrawConfig";

export async function handleDrawChartsFromConfig(
  roundId: number,
  activeConfig: ChartdrawConfigWithSpecs
) {
  // 1. Build an array of allowed durations based on activeConfig
  const allowedDurations: (string | null)[] = [];
  if (activeConfig.contains_arcade) allowedDurations.push("ARCADE");
  if (activeConfig.contains_shortcut) allowedDurations.push("SHORTCUT");
  if (activeConfig.contains_remix) allowedDurations.push("REMIX");
  if (activeConfig.contains_full) allowedDurations.push("FULL");
  allowedDurations.push(null); 

  const entriesToInsert: any[] = [];
  const groupOrderCounters: Record<string | number, number> = {};

  for (const spec of activeConfig.chartdraw_config_specs) {
    const quantity = Number(spec.quantity);
    const currentGroup = spec.group ?? null;
    const groupKey = currentGroup ?? "null";

    // Initialize the counter for this group if it doesn't exist yet
    if (groupOrderCounters[groupKey] === undefined) {
      groupOrderCounters[groupKey] = 1;
    }
    
    // 2. Build the base query
    let query = supabaseClient
      .from("charts")
      .select("id")
      .eq("type", spec.chart_type)
      .gte("level", spec.level_min)
      .lte("level", spec.level_max);

    // 3. Apply the null-safe duration filter
    if (allowedDurations.length > 0) {
      const cleanDurations = allowedDurations.filter(Boolean) as string[];
      const includesNull = allowedDurations.includes(null);

      if (includesNull && cleanDurations.length > 0) {
        query = query.or(`duration.in.(${cleanDurations.join(',')}),duration.is.null`);
      } else if (includesNull) {
        query = query.is("duration", null);
      } else {
        query = query.in("duration", cleanDurations);
      }
    }

    // 4. Fetch all matching rows for this spec
    const { data: matchedCharts, error } = await query;
    if (error) throw error;

    if (matchedCharts && matchedCharts.length > 0) {
      // 5. Client-Side Shuffle
      const shuffledCharts = matchedCharts.sort(() => 0.5 - Math.random());
      const selectedCharts = shuffledCharts.slice(0, quantity);

      selectedCharts.forEach((chart) => {
        entriesToInsert.push({
          round_id: roundId,
          chart_id: chart.id,
          action: null, 
          group: currentGroup,
          order: groupOrderCounters[groupKey]++
        });
      });
    }
  }

  // 7. Bulk insert all selected charts
  if (entriesToInsert.length > 0) {
    const { error: insertError } = await supabaseClient
      .from("chartdraw_entries")
      .insert(entriesToInsert);

    if (insertError) throw insertError;
  }
}