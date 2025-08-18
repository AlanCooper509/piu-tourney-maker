import { supabaseClient } from "../lib/supabaseClient";

export async function handleDeletePlayerFromRound(playerRoundId: number): Promise<void> {
  const { error } = await supabaseClient
    .from("player_rounds")
    .delete()
    .eq("id", playerRoundId);

  if (error) {
    throw error;
  }
}