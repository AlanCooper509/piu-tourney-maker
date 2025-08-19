import { supabaseClient } from "../lib/supabaseClient";

export async function handleAddStageToRound(roundId: number) {
  const { data, error } = await supabaseClient
    .from("stages")
    .insert([
      {
        round_id: roundId,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Stage already exists in this round.`);
    }
    throw error;
  }

  return data;
}