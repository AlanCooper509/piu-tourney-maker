import { supabaseClient } from '../lib/supabaseClient';

export default async function getPlayersInRound(roundId: number) {
  const { data, error } = await supabaseClient
    .from('player_rounds')
    .select('*, player_tourneys(player_name)')
    .eq('round_id', roundId)
    .order('id', { ascending: true })

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No entries found');
  }

  return data;
}