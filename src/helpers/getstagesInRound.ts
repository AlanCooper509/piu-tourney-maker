import { supabaseClient } from '../lib/supabaseClient';

export default async function getStagesInRound(roundId: number) {
  const { data, error } = await supabaseClient
    .from('stages')
    .select('*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)')
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