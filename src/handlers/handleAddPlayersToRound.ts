import { supabaseClient } from "../lib/supabaseClient";

export async function handleAddPlayersToNextRound(nextRoundId: number, advancingPlayersTourneyIds: number[]) {
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

export async function handleAddPlayersMapToRounds(
  roundToPlayersMap: Record<number, number[]>
) {
  // flatten the mapping into a single array of insert objects
  const entries = Object.entries(roundToPlayersMap).flatMap(
    ([roundId, playerIds]) =>
      playerIds.map(playerId => ({
        round_id: Number(roundId),
        player_tourney_id: playerId,
      }))
  );

  if (entries.length === 0) {
    console.warn("No player-round entries to insert.");
    return { data: null, error: null };
  }

  const allPlayerTourneyIds = Array.from(
    new Set(entries.map((e) => e.player_tourney_id))
  );

  // STEP 1: Delete any existing player_rounds for those players
  const { error: deleteError } = await supabaseClient
    .from("player_rounds")
    .delete()
    .in("player_tourney_id", allPlayerTourneyIds);

  if (deleteError) {
    console.error("Error deleting old player_rounds entries:", deleteError.message);
    return { data: null, error: deleteError };
  }

  // STEP 2: Insert new player_rounds entries
  const { data, error } = await supabaseClient
    .from("player_rounds")
    .insert(entries)
    .select("*, player_tourneys (player_name)");

  if (error) {
    console.error("Error inserting players into rounds:", error.message);
  } else {
    console.log(`Successfully added ${data.length} player(s) to round(s).`, data);
  }

  return { data, error };
}