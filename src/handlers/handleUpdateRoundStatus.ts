import { updateSupabaseTable } from '../helpers/updateSupabaseTable';
import type { Round, RoundStatus } from '../types/Round';

export default async function handleUpdateRoundStatus(roundId: number, status: RoundStatus) {
  if (!roundId) throw new Error("Round ID is required");

  const updated = await updateSupabaseTable<Round>(
    'rounds',
    { status },
    [{ column: 'id', value: roundId }]
  );

  return updated;
}