import { supabaseClient } from '../lib/supabaseClient';
import type { PlayerTourney } from '../types/PlayerTourney';

export async function handleRenamePlayerInTourney(
  id: number,
  newName: string
): Promise<PlayerTourney> {
  if (!newName.trim()) {
    throw new Error('Player name cannot be empty');
  }

  const { data, error } = await supabaseClient
    .from('player_tourneys')
    .update({ player_name: newName.trim() })
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