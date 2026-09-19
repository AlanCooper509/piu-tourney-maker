import handleCheckTourneyStatus from '../../handleCheckTourneyStatus';
import { calculateCombinedRoundRankings } from '../../../helpers/calculateCombinedRoundRankings';
import getStagesInRound from '../../../helpers/getstagesInRound';
import getPlayersInRound from '../../../helpers/getPlayersInRound';
import { getRoundsInTourney } from '../../../helpers/getRoundsInTourney';
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

    let carryOverData = null;
    if (round.carry_over_round_id) {
      const roundsInTourney = await getRoundsInTourney(tourneyId);
      const carryOverRound = roundsInTourney.find(r => r.id === round.carry_over_round_id);
      if (carryOverRound) {
        const [carryOverStages, carryOverPlayers] = await Promise.all([
          getStagesInRound(carryOverRound.id),
          getPlayersInRound(carryOverRound.id)
        ]);
        carryOverData = { round: carryOverRound, players: carryOverPlayers, stages: carryOverStages };
      }
    }

    const { rankings } = calculateCombinedRoundRankings(round, players, stages, carryOverData);

    const idMap = Object.fromEntries(players.map(p => [p.id, p.player_tourney_id]));

    const rankedPlayers = rankings.map(([pRoundId], index) => ({
      playerTourneyId: idMap[pRoundId] ?? pRoundId,
      sortOrder: index + 1 // 1-based indexing (Rank 1 = sort_order 1)
    }));

    return await executeRoundTransition({
      tourneyId,
      round,
      tourneyType,
      rankedPlayers
    });
  } catch (error) {
    console.error('Failed to end round:', error);
    throw error;
  }
}