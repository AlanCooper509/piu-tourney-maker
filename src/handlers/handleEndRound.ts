import handleCheckTourneyStatus from './handleCheckTourneyStatus';
import handleUpdateRoundStatus from './handleUpdateRoundStatus';
import calculatePlayerRankingsInRound from '../helpers/calculatePlayerRankingsInRound';
import handleAddPlayersToRound from './handleAddPlayersToRound';
import { handleUpdateTourneyStatus } from './handleUpdateTourneyStatus';
import { getRoundsInTourney } from '../helpers/getRoundsInTourney';
import getStagesInRound from '../helpers/getstagesInRound';
import getPlayersInRound from '../helpers/getPlayersInRound';

import type { PlayerRound } from '../types/PlayerRound';
import type { Round } from '../types/Round';
import type { Stage } from '../types/Stage';

interface handleStartRoundProps {
  tourneyId: number;
  round: Round;
}

function getAdvancingPlayersTourneyIds(round: Round, players: PlayerRound[], stages: Stage[]) {
    // Get playerRoundIds of advancing players
    const rankings = calculatePlayerRankingsInRound({ players, stages });
    const cutoff = round.players_advancing > rankings.length ? rankings.length : round.players_advancing;
    const advancingPlayersRoundIds = rankings.slice(0, cutoff);

    // create lookup map (player round id to tourney id)
    const playerRoundIdToTourneyId = players.reduce((acc, player) => {
      acc[player.id] = player.player_tourney_id;
      return acc;
    }, {} as Record<number, number>);

    // in advancingPlayersRoundIds, replace player round id values (index 0) with their corresponding player_tourney_id values
    const advancingPlayersTourneyIdsWithScores = advancingPlayersRoundIds.map(([playerRoundId, score]) => {
      const tourneyId = playerRoundIdToTourneyId[playerRoundId];
      return [tourneyId ?? playerRoundId, score]; // fallback to playerId if no mapping found; should never happen due to db table constraints
    });

    const advancingPlayersTourneyIds = advancingPlayersTourneyIdsWithScores.map(item => item[0]);
    return advancingPlayersTourneyIds;
}

async function getNextRoundId(tourneyId: number, roundId: number) {
  // get rounds associated with tourney (for handling player advancement)
  // this underlying query should do ORDER() when fetching the auto-incrementing rounds.id column as our method of handling "round progression" (for now)
  const rounds = await getRoundsInTourney(tourneyId);
  const currentIndex = rounds.findIndex(r => r.id === roundId);
  const nextRound = rounds[currentIndex + 1];
  const nextRoundId = nextRound?.id ?? null;
  return nextRoundId;
}

export default async function handleEndRound({ tourneyId, round }: handleStartRoundProps) {
  
  
  if (!round?.id) throw new Error('Round ID is required!');
  const stages = await getStagesInRound(round.id);
  if (!stages) throw new Error('No stages were played!');
  
  const players = await getPlayersInRound(round.id);
  if (!players) throw new Error('No players to advance!');
  
  try {
    // Ensure tournament has started already
    const { data: tourneyData } = await handleCheckTourneyStatus(round.id);
    if (!tourneyData || !tourneyData.tourneys || tourneyData.tourneys.status !== 'In Progress') {
      throw new Error('Tournament is not in progress. Cannot make modifications.');
    }

    // find next round ID (if there is one)
    const nextRoundId = await getNextRoundId(tourneyId, round.id);
    if (nextRoundId) {
      const advancingPlayersTourneyIds = getAdvancingPlayersTourneyIds(round, players, stages);
      console.log(advancingPlayersTourneyIds)
      console.log(nextRoundId)
      handleAddPlayersToRound(nextRoundId, advancingPlayersTourneyIds);
    }

    const updatedRound = await handleUpdateRoundStatus(round.id, 'Complete');

    // all rounds are now complete!
    if (!nextRoundId) {
      handleUpdateTourneyStatus(tourneyId, 'Complete');
    }
    return { updatedRound };
  } catch (error) {
    console.error('Failed to end round:', error);
    throw error;
  }
}