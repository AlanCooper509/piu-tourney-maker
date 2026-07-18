import { supabaseClient } from "../../lib/supabaseClient";
import type { ChartdrawConfigWithSpecs } from "../../types/ChartDrawConfig";
import handleUpdateRoundStatus from "../round/handleUpdateRoundStatus";

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
      .lte("level", spec.level_max)
      .is("game_id", null); // TODO: hotfix for BITE9 Pros

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
      // 5. Client-Side Shuffle for individual spec pool
      const shuffledCharts = matchedCharts.sort(() => 0.5 - Math.random());
      const selectedCharts = shuffledCharts.slice(0, quantity);

      selectedCharts.forEach((chart) => {
        entriesToInsert.push({
          round_id: roundId,
          chart_id: chart.id,
          action: null,
          group: currentGroup,
          // assign final ordering after shuffling between spec pools (difficulties)
        });
      });
    }
  }

  // 6. Shuffle the entire accumulated pool so difficulties mix together
  const mixedEntries = entriesToInsert.sort(() => 0.5 - Math.random());

  // 7. Apply the group orders they are fully mixed
  const finalEntriesToInsert = mixedEntries.map((entry) => {
    const groupKey = entry.group ?? "null";
    return {
      ...entry,
      draw_order: groupOrderCounters[groupKey]++
    };
  });

  // 8. Bulk insert the shuffled combined entries
  if (finalEntriesToInsert.length > 0) {
    const { error: insertError } = await supabaseClient
      .from("chartdraw_entries")
      .insert(finalEntriesToInsert);

    if (insertError) throw insertError;
  }

  // 9. Update the round status to "Pick Ban"
  await handleUpdateRoundStatus(roundId, "Pick Ban");
}
