import { supabaseClient } from "../../lib/supabaseClient";

import handleUpdateRoundStatus from "../round/handleUpdateRoundStatus";

import type { ChartdrawEntryWithDetails } from "../../types/ChartDrawEntry";

export async function handleCreateStages(
  roundId: number, 
  chartdrawEntries: ChartdrawEntryWithDetails[]
): Promise<void> {
  const finalPicks = chartdrawEntries.filter(
    (entry) => entry.action === "PICK" || entry.action === "AUTOPICK"
  );

  if (finalPicks.length === 0) {
    throw new Error("No charts have been picked to lock in.");
  }

  // 1. Sort by play_order ascending to keep insertion records completely sequential
  const sortedPicks = [...finalPicks].sort(
    (a, b) => (a.play_order ?? 0) - (b.play_order ?? 0)
  );

  // 2. Map entries into the schema including the new play_order column
  const stagesToInsert = sortedPicks.map((entry) => ({
    round_id: roundId,
    chart_id: entry.chart_id,
    play_order: entry.play_order,
  }));

  // 3. Insert stages (Hard error if this fails)
  const { error } = await supabaseClient
    .from("stages")
    .insert(stagesToInsert);

  if (error) {
    throw error;
  }

  // 4. Update the round to "Ready"
  try {
    await handleUpdateRoundStatus(roundId, "Ready");
  } catch (roundUpdateError) {
    // "soft error" (stages insert was successful, round status update was not)
    console.error("Failed to update round status to In Progress:", roundUpdateError);
  }
}