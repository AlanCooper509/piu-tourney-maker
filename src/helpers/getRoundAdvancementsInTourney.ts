import { supabaseClient } from '../lib/supabaseClient';
import { getRoundsInTourney } from './getRoundsInTourney';

export async function getRoundAdvancementsInTourney(tourneyId: number) {
  const rounds = await getRoundsInTourney(tourneyId);
  const roundIds = rounds.map(r => r.id);

  if (roundIds.length === 0) return [];

  const { data, error } = await supabaseClient
    .from('round_advancements')
    .select('*')
    .in('round_id', roundIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}
