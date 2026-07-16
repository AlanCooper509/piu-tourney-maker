import handleCheckTourneyStatus from '../../handleCheckTourneyStatus';
import calculatePlayerRankingsInRound from '../../../helpers/calculatePlayerRankingsInRound';
import getStagesInRound from '../../../helpers/getstagesInRound';
import getPlayersInRound from '../../../helpers/getPlayersInRound';
import { executeRoundTransition } from './executeRoundTransition';

import type { Round } from '../../../types/Round';
import type { TourneyType } from '../../../types/Tourney';

interface HandleEndRoundProps {
  tourneyId: number;
  round: Round;
  tourneyType: TourneyType | null;
}

export default async function handleEndRound({ tourneyId, round, tourneyType }: HandleEndRoundProps) {  
  if (!round?.id) throw new Error('Round ID is required!');
  
  const stages = await getStagesInRound(round.id);
  if (!stages || stages.length === 0) throw new Error('No stages were played!');
  
  const players = await getPlayersInRound(round.id);
  if (!players || players.length === 0) throw new Error('No players to advance!');

  try {
    const { data: tourneyData } = await handleCheckTourneyStatus(undefined, tourneyId);
    if (!tourneyData || !tourneyData.tourneys || tourneyData.tourneys.status !== 'In Progress') {
      throw new Error('Tournament is not in progress. Cannot make modifications.');
    }

    const { rankings } = calculatePlayerRankingsInRound({ players, stages, round });
    const cutoff = Math.min(round.players_advancing, rankings.length);

    const idMap = Object.fromEntries(players.map(p => [p.id, p.player_tourney_id]));
    
    const advancingRankings = rankings.slice(0, cutoff).map(([pRoundId], index) => ({
      playerTourneyId: idMap[pRoundId] ?? pRoundId,
      sortOrder: index + 1 // 1-based indexing (Rank 1 = sort_order 1)
    }));

    const nonAdvancingRankings = rankings.slice(cutoff).map(([pRoundId], index) => ({
      playerTourneyId: idMap[pRoundId] ?? pRoundId,
      sortOrder: index + 1 // 1-based indexing (Rank 1 = sort_order 1)
    }));

    return await executeRoundTransition({
      tourneyId,
      round,
      tourneyType,
      advancingPlayers: advancingRankings,
      nonAdvancingPlayers: nonAdvancingRankings
    });
  } catch (error) {
    console.error('Failed to end round:', error);
    throw error;
  }
}