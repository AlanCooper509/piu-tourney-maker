import { supabaseClient } from '../lib/supabaseClient';
import type { Round } from '../types/Round';

export async function handleUpdateRoundDetails(
  roundId: number,
  newName: string,
  playersAdvancing: number,
  nextRoundId: number | undefined
): Promise<Round> {
  if (!roundId) {
    throw new Error('Round ID is required');
  }
  if (!newName.trim()) {
    throw new Error('Round name cannot be empty');
  }

  const { data, error } = await supabaseClient
    .from('rounds')
    .update({ name: newName.trim(), players_advancing: playersAdvancing, next_round_id: nextRoundId })
    .eq('id', roundId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Round "${newName.trim()}" already exists in this tournament.`);
    }
    throw error;
  }

  if (!data) {
    throw new Error('Round not found');
  }

  return data;
}