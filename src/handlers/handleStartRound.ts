import handleUpdateRoundStatus from './handleUpdateRoundStatus'
import handleCheckTourneyStatus from './handleCheckTourneyStatus'

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