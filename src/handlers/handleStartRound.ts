import { updateSupabaseTable } from '../helpers/updateSupabaseTable';
import { supabaseClient } from '../lib/supabaseClient';

import type { Round, RoundStatus } from '../types/Round';

async function handleUpdateRoundStatus(roundId: number, status: RoundStatus) {
  if (!roundId) throw new Error("Round ID is required");

  const updated = await updateSupabaseTable<Round>(
    'rounds',
    { status },
    [{ column: 'id', value: roundId }]
  );

  return updated;
}

async function handleCheckTourneyStatus(roundId: number) {
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

export async function handleStartRound(roundId: number) {
  if (!roundId) throw new Error('Round ID is required');

  try {
    // Ensure tournament has started already
    const { data: tourneyData } = await handleCheckTourneyStatus(roundId);
    if (!tourneyData || !tourneyData.tourneys || tourneyData.tourneys.status !== 'In Progress') {
      throw new Error('Tournament is not in progress');
    }

    const updatedRound = await handleUpdateRoundStatus(roundId, 'In Progress');
    return { updatedRound };
  } catch (error) {
    console.error('Failed to start round:', error);
    throw error;
  }
}