import { updateSupabaseTable } from '../helpers/updateSupabaseTable';

import type { Tourney, TourneyStatus } from '../types/Tourney';

export interface StartTourneyOptions {
  tourneyId: number;
}

export async function handleStartTourney({ tourneyId }: StartTourneyOptions) {
  if (!tourneyId) throw new Error('Tourney ID is required');

  try {
    const updatedTourney = await handleUpdateTourneyStatus(tourneyId, 'In Progress');
    return { updatedTourney };
  } catch (error) {
    console.error('Failed to start tourney:', error);
    throw error;
  }
}

async function handleUpdateTourneyStatus(tourneyId: number, status: TourneyStatus) {
  if (!tourneyId) throw new Error("Tourney ID is required");

  const updated = await updateSupabaseTable<Tourney>(
    'tourneys',
    { status },
    [{ column: 'id', value: tourneyId }]
  );

  return updated;
}
