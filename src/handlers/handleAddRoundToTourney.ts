import { supabaseClient } from "../lib/supabaseClient";

export async function handleAddRoundToTourney(
  tourneyId: number,
  roundName: string,
  playersAdvancing: number
) {
  const { data, error } = await supabaseClient
    .from("rounds")
    .insert([
      {
        tourney_id: tourneyId,
        name: roundName,
        players_advancing: playersAdvancing,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Round "${roundName}" already exists in this tourney.`);
    }
    throw error;
  }

  return data;
}