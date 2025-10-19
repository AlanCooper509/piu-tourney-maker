import { supabaseClient } from "../../lib/supabaseClient";

export async function handleAddPlayerToRound(
  playerName: string,
  roundId: number,
  tourneyId: number
) {
  // Step 1: find the player_tourneys row
  const { data: playerTourney, error: fetchError } = await supabaseClient
    .from("player_tourneys")
    .select("id")
    .eq("tourney_id", tourneyId)
    .eq("player_name", playerName)
    .single();

  if (fetchError || !playerTourney) {
    throw new Error(
      `Could not find player "${playerName}" in Tournament ID: ${tourneyId}`
    );
  }

  // Step 2: insert into player_rounds
  const { data: playerRound, error: insertError } = await supabaseClient
    .from("player_rounds")
    .insert([
      {
        round_id: roundId,
        player_tourney_id: playerTourney.id,
      },
    ])
    .select('*, player_tourneys (player_name)')
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error(
        `Player "${playerName}" is already registered in Round ID: ${roundId}`
      );
    }
    throw new Error(
      `Failed to add player "${playerName}" to Round ID: ${roundId}: ${insertError.message}`
    );
  }

  return playerRound;
}