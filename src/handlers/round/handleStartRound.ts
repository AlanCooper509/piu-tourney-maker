import { supabaseClient } from "../../lib/supabaseClient";
import handleUpdateRoundStatus from './handleUpdateRoundStatus';
import handleCheckTourneyStatus from '../handleCheckTourneyStatus';

export async function handleStartRound(tourneyId: number, roundId: number) {
  if (!roundId) throw new Error('Round ID is required');

  try {
    const { data: roundData } = await handleCheckTourneyStatus(undefined, tourneyId);
    if (!roundData || !roundData.tourneys) {
      throw new Error('Tournament data not found');
    }

    const tourneyStatus = roundData.tourneys.status;

    // 2. If the tournament hasn't started yet, kick it into "In Progress"
    if (tourneyStatus === 'Not Started') {
      const { error: tourneyUpdateError } = await supabaseClient
        .from('tourneys')
        .update({ status: 'In Progress' })
        .eq('id', tourneyId);

      if (tourneyUpdateError) throw tourneyUpdateError;
    } else if (tourneyStatus !== 'In Progress') {
      // Safeguard against trying to start a round in a "Completed" or "Cancelled" tourney
      throw new Error(`Cannot start a round when tournament status is "${tourneyStatus}"`);
    }

    // 3. Move the round itself to "In Progress"
    const updatedRound = await handleUpdateRoundStatus(roundId, 'In Progress');
    return { updatedRound };
  } catch (error) {
    console.error('Failed to start round:', error);
    throw error;
  }
}