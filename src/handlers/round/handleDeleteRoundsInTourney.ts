import { supabaseClient } from "../../lib/supabaseClient";

export async function handleDeleteRoundsInTourney(tourneyId: number | null): Promise<void> {
  if (!tourneyId) {
    throw new Error("No tourney ID provided.");
  }

  const { error } = await supabaseClient
    .from("rounds")
    .delete()
    .eq("tourney_id", tourneyId);

  if (error) {
    throw error;
  }
}