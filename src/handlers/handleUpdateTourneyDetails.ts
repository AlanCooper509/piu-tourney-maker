import { updateSupabaseTable } from '../helpers/updateSupabaseTable';
import type { Tourney, TourneyType } from '../types/Tourney';

export interface TourneyDetailsUpdate {
  name: string;
  ddrToolsRoom: string | null;
  type?: TourneyType;
}

export async function handleUpdateTourneyDetails(tourneyId: number, details: TourneyDetailsUpdate) {
  if (!tourneyId) throw new Error("Tourney ID is required");
  if (!details.name) throw new Error("New name is required");

  const values: Partial<Tourney> = { name: details.name, ddrtools_room: details.ddrToolsRoom };
  if (details.type !== undefined) values.type = details.type;

  const updated = await updateSupabaseTable<Tourney>(
    'tourneys',
    values,
    [{ column: 'id', value: tourneyId }]
  );

  return updated[0];
}
