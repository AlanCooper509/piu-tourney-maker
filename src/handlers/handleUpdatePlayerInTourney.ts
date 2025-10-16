import { supabaseClient } from '../lib/supabaseClient';
import type { PlayerTourney } from '../types/PlayerTourney';

export async function handleUpdatePlayerInTourney(
  id: number,
  newName: string,
  newSeed: number | null
): Promise<PlayerTourney> {
  if (!newName.trim()) {
    throw new Error('Player name cannot be empty');
  }

  const { data, error } = await supabaseClient
    .from('player_tourneys')
    .update({ player_name: newName.trim(), seed: newSeed })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Player "${newName.trim()}" already exists in this tourney.`);
    }
    throw error;
  }

  if (!data) {
    throw new Error('Player not found in this tournament');
  }

  return data;
}