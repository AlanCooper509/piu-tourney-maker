import { supabaseClient } from '../lib/supabaseClient';
import { updateSupabaseTable } from '../helpers/updateSupabaseTable';

import type { Tourney, TourneyStatus } from '../types/Tourney';

export interface StartTourneyOptions {
  tourneyId: number;
  seedPlayersIntoEarliestRound?: boolean; // optional, default to false
}

export async function handleStartTourney({
  tourneyId,
  seedPlayersIntoEarliestRound = false,
}: StartTourneyOptions) {
  if (!tourneyId) throw new Error('Tourney ID is required');

  try {
    const updatedTourney = await handleUpdateTourneyStatus(tourneyId, 'In Progress');
 
    let insertedRows = undefined;
    if (seedPlayersIntoEarliestRound) {
      insertedRows = await insertPlayersIntoEarliestRound(tourneyId);
    }

    return { updatedTourney, insertedRows };
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

/**
 * Inserts all player_tourneys for a given tourney into player_rounds
 * using the earliest round_id from the rounds table.
 * Skips duplicates if already inserted.
 * 
 * @param tourneyId - The tournament ID
 */
async function insertPlayersIntoEarliestRound(tourneyId: number) {
  try {
    // find the earliest round for this tourney
    const { data: rounds, error: roundsError } = await supabaseClient
      .from("rounds")
      .select("id")
      .eq("tourney_id", tourneyId)
      .order("id", { ascending: true })
      .limit(1);

    if (roundsError) throw roundsError;
    if (!rounds || rounds.length === 0) {
      console.warn("No rounds found for this tourney.");
      return;
    }

    const roundId = rounds[0].id;

    // get all player_tourneys for this tourney
    const { data: playerTourneys, error: fetchError } = await supabaseClient
      .from("player_tourneys")
      .select("id, player_name")
      .eq("tourney_id", tourneyId);

    if (fetchError) throw fetchError;
    if (!playerTourneys || playerTourneys.length === 0) {
      console.warn("No players found for this tourney.");
      return;
    }

    // check for existing player_rounds for this round
    const { data: existingRecords, error: existingError } = await supabaseClient
      .from("player_rounds")
      .select("player_tourney_id")
      .eq("round_id", roundId);

    if (existingError) throw existingError;

    const existingIds = new Set(existingRecords?.map((pr) => pr.player_tourney_id));

    // filter out duplicates
    const rowsToInsert = playerTourneys
      .filter((pt) => !existingIds.has(pt.id))
      .map((pt) => ({
        player_tourney_id: pt.id,
        round_id: roundId,
      }));

    if (rowsToInsert.length === 0) {
      console.log("All players already inserted for this round.");
      return [];
    }

    // insert into player_rounds
    const { data: inserted, error: insertError } = await supabaseClient
      .from("player_rounds")
      .insert(rowsToInsert);

    if (insertError) throw insertError;

    return inserted;
  } catch (err) {
    console.error("Error inserting players into earliest round:", err);
    return null;
  }
}