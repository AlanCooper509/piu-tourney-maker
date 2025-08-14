import { supabaseClient } from "../lib/supabaseClient";

export async function handleDeletePlayerFromTourney(playerId: number): Promise<void> {
  const { error } = await supabaseClient
    .from("player_tourneys")
    .delete()
    .eq("id", playerId);

  if (error) {
    throw error;
  }
}