import { updateSupabaseTable } from '../helpers/updateSupabaseTable';
import type { Tourney } from '../types/Tourney';

export async function handleUpdateTourneyName(tourneyId: number, newName: string) {
  if (!tourneyId) throw new Error("Tourney ID is required");
  if (!newName) throw new Error("New name is required");

  const updated = await updateSupabaseTable<Tourney>(
    'tourneys',
    { name: newName },
    [{ column: 'id', value: tourneyId }]
  );

  return updated[0];
}