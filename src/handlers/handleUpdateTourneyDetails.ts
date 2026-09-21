import { updateSupabaseTable } from '../helpers/updateSupabaseTable';
import type { Tourney } from '../types/Tourney';

export interface TourneyDetailsUpdate {
  name: string;
  ddrToolsRoom: string | null;
}

export async function handleUpdateTourneyDetails(tourneyId: number, details: TourneyDetailsUpdate) {
  if (!tourneyId) throw new Error("Tourney ID is required");
  if (!details.name) throw new Error("New name is required");

  const updated = await updateSupabaseTable<Tourney>(
    'tourneys',
    { name: details.name, ddrtools_room: details.ddrToolsRoom },
    [{ column: 'id', value: tourneyId }]
  );

  return updated[0];
}
