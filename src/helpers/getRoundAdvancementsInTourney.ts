import { supabaseClient } from '../lib/supabaseClient';
import { getRoundsInTourney } from './getRoundsInTourney';

import type { RoundAdvancement } from '../types/RoundAdvancement';

export async function getRoundAdvancementsInTourney(tourneyId: number) {
  const rounds = await getRoundsInTourney(tourneyId);
  return getRoundAdvancementsForRounds(rounds.map(r => r.id));
}

/** Same query, for callers that already have the round ids (saves re-fetching the rounds). */
export async function getRoundAdvancementsForRounds(roundIds: number[]): Promise<RoundAdvancement[]> {
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
