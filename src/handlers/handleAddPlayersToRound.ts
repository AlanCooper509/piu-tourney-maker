import { supabaseClient } from "../lib/supabaseClient";

export default async function handleAddPlayersToRound(nextRoundId: number, advancingPlayersTourneyIds: number[]) {
  const entries = advancingPlayersTourneyIds.map(id => ({
    round_id: nextRoundId,
    player_tourney_id: id,
  }));

  const { data, error } = await supabaseClient
    .from("player_rounds")
    .insert(entries)
    .select('*, player_tourneys (player_name)');

  if (error) {
    console.error("Error inserting players into round:", error.message);
  } else {
    console.log("Successfully added players to round:", data);
  }

  return { data, error };
}