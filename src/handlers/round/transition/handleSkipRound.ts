import getPlayersInRound from '../../../helpers/getPlayersInRound';
import sortPlayersBySeed from '../../../helpers/sortPlayersBySeed';
import { executeRoundTransition } from './executeRoundTransition';

import type { Round } from '../../../types/Round';
import type { TourneyType } from '../../../types/Tourney';

interface HandleSkipRoundProps {
  tourneyId: number;
  round: Round;
  tourneyType: TourneyType | null;
}

export default async function handleSkipRound({ tourneyId, round, tourneyType }: HandleSkipRoundProps) {  
  if (!round?.id) throw new Error('Round ID is required!');
  
  const players = await getPlayersInRound(round.id);
  if (!players || players.length === 0) throw new Error('No players to advance!');

  try {
    const sortedPlayers = sortPlayersBySeed(players);
    const cutoff = Math.min(round.players_advancing, sortedPlayers.length);

    const advancingIds = sortedPlayers.slice(0, cutoff).map(p => p.player_tourney_id);
    const nonAdvancingIds = sortedPlayers.slice(cutoff).map(p => p.player_tourney_id);

    return await executeRoundTransition({
      tourneyId,
      round,
      tourneyType,
      advancingIds,
      nonAdvancingIds
    });
  } catch (error) {
    console.error('Failed to skip round:', error);
    throw error;
  }
}