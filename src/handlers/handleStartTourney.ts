import { handleUpdateTourneyStatus } from './handleUpdateTourneyStatus';

export async function handleStartTourney(tourneyId: number) {
  if (!tourneyId) throw new Error('Tourney ID is required');

  try {
    const updatedTourney = await handleUpdateTourneyStatus(tourneyId, 'In Progress');
    // TODO: for now, add all players to starting round
    // TODO: eventually, will want to also add support for multiple starting rounds or manual placements...

    return updatedTourney;
  } catch (error) {
    console.error('Failed to start tourney:', error);
    throw error;
  }
}