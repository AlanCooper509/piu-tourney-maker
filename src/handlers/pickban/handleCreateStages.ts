import { supabaseClient } from "../../lib/supabaseClient";
import type { ChartdrawEntryWithDetails } from "../../types/ChartDrawEntry";

export async function handleCreateStages(roundId: number, chartdrawEntries: ChartdrawEntryWithDetails[]): Promise<void> {
  const finalPicks = chartdrawEntries.filter(
    (entry) => entry.action === "PICK" || entry.action === "AUTOPICK"
  );

  if (finalPicks.length === 0) {
    throw new Error("No charts have been picked to lock in.");
  }

  // Sort by play_order ascending to keep insertion records completely sequential
  const sortedPicks = [...finalPicks].sort(
    (a, b) => (a.play_order ?? 0) - (b.play_order ?? 0)
  );

  // Map entries into the schema including the new play_order column
  const stagesToInsert = sortedPicks.map((entry) => ({
    round_id: roundId,
    chart_id: entry.chart_id,
    play_order: entry.play_order,
  }));

  const { error } = await supabaseClient
    .from("stages")
    .insert(stagesToInsert);

  if (error) {
    throw error;
  }
}