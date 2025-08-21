import { supabaseClient } from '../lib/supabaseClient';

export async function getRoundsInTourney(tourneyId: number) {
  const { data, error } = await supabaseClient
    .from('rounds')
    .select('*')
    .eq('tourney_id', tourneyId)
    .order('id', { ascending: true })

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No entries found');
  }

  return data;
}