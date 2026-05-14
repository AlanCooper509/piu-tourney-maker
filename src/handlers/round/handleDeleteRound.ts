import { supabaseClient } from "../../lib/supabaseClient";

export async function handleDeleteRound(roundId: number | null): Promise<void> {
  if (!roundId) {
    throw new Error("No round ID provided.");
  }

  const { error } = await supabaseClient
    .from("rounds")
    .delete()
    .eq("id", roundId);

  if (error) {
    throw error;
  }
}