import { updateSupabaseTable } from '../helpers/updateSupabaseTable';
import type { Round } from '../types/Round';

export async function handleUpdateRoundName(roundId: number, newName: string) {
  if (!roundId) throw new Error("Round ID is required");
  if (!newName) throw new Error("New name is required");

  const updated = await updateSupabaseTable<Round>(
    'rounds',
    { name: newName },
    [{ column: 'id', value: roundId }]
  );

  return updated[0];
}