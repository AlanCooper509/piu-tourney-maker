import { supabaseClient } from '../lib/supabaseClient';

export default async function handleCheckTourneyStatus(roundId: number) {
  if (!roundId) throw new Error('Round ID is required');

  const { data, error } = await supabaseClient
    .from('rounds')
    .select('*, tourneys(status)')
    .eq('id', roundId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching round with tourney status:', error);
    throw new Error('Could not fetch round data');
  }

  return { data };
}