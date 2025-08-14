import { supabaseClient } from "../lib/supabaseClient";

export async function handleAddPlayerToTourney(tourneyId: number, playerName: string) {
  const { data, error } = await supabaseClient
    .from('player_tourneys')
    .insert([{ tourney_id: tourneyId, player_name: playerName }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Player "${playerName}" already exists in this tourney.`);
    }
    throw error;
  }

  return data;
};