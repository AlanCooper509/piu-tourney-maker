import { supabaseClient } from "../lib/supabaseClient";

export async function handleAddPlayerToTourney(tourneyId: number, playerName: string, seed?: number | null) {
  const { data, error } = await supabaseClient
    .from('player_tourneys')
    .insert([{ tourney_id: tourneyId, player_name: playerName, seed: seed ?? null }])
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

export async function handleAddPlayersToTourney(
  tourneyId: number,
  players: { name: string; seed: number | null }[]
) {
  if (players.length === 0) return [];

  const { data, error } = await supabaseClient
    .from('player_tourneys')
    .insert(players.map(p => ({ tourney_id: tourneyId, player_name: p.name, seed: p.seed ?? null })))
    .select();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`One or more of these players already exist in this tourney.`);
    }
    throw error;
  }

  return data;
}