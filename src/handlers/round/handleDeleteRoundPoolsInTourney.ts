import { supabaseClient } from "../../lib/supabaseClient";

export async function handleDeleteRoundPoolsInTourney(tourneyId: number): Promise<void> {
  const { error } = await supabaseClient
    .from("round_pools")
    .delete()
    .eq("tourney_id", tourneyId);

  if (error) {
    throw error;
  }
}