import { updateSupabaseTable } from '../helpers/updateSupabaseTable';
import type { Tourney, TourneyStatus } from '../types/Tourney';

export async function handleUpdateTourneyStatus(tourneyId: number, status: TourneyStatus) {
  if (!tourneyId) throw new Error("Tourney ID is required");

  const updated = await updateSupabaseTable<Tourney>(
    'tourneys',
    { status },
    [{ column: 'id', value: tourneyId }]
  );

  return updated;
}