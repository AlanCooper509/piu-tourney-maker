import handleCheckTourneyStatus from '../handleCheckTourneyStatus';
import handleUpdateRoundStatus from './handleUpdateRoundStatus';
import calculatePlayerRankingsInRound from '../../helpers/calculatePlayerRankingsInRound';
import {handleAddPlayersToRound} from './handleAddPlayersToRound';
import { handleUpdateTourneyStatus } from '../handleUpdateTourneyStatus';
import { getRoundsInTourney } from '../../helpers/getRoundsInTourney';
import getStagesInRound from '../../helpers/getstagesInRound';
import getPlayersInRound from '../../helpers/getPlayersInRound';

import type { PlayerRound } from '../../types/PlayerRound';
import type { Round } from '../../types/Round';
import type { Stage } from '../../types/Stage';

interface handleStartRoundProps {
  tourneyId: number;
  round: Round;
}

function determineNextRoundId(roundId: number, rounds: Round[]) {
  const currentIndex = rounds.findIndex(r => r.id === roundId);
  const nextRound = rounds[currentIndex + 1];
  const nextRoundId = nextRound?.id ?? null;
  return nextRoundId;
}

function determineChildRounds(roundId: number, rounds: Round[]): Round[] {
  return rounds.filter(r => r.parent_round_id === roundId);
}

export default async function handleEndRound({ tourneyId, round }: handleStartRoundProps) {  
  if (!round?.id) throw new Error('Round ID is required!');
  const stages = await getStagesInRound(round.id);
  if (!stages) throw new Error('No stages were played!');
  const players = await getPlayersInRound(round.id);
  if (!players) throw new Error('No players to advance!');

  // get rounds associated with tourney (for handling player advancement)
  // this underlying query should do ORDER() when fetching the auto-incrementing rounds.id column as our method of handling "round progression" (for now)
  const rounds = await getRoundsInTourney(tourneyId);

  try {
    // Ensure tournament has started already
    const { data: tourneyData } = await handleCheckTourneyStatus(round.id);
    if (!tourneyData || !tourneyData.tourneys || tourneyData.tourneys.status !== 'In Progress') {
      throw new Error('Tournament is not in progress. Cannot make modifications.');
    }

    // find next round ID (if there is one)
    const nextRoundId = round.next_round_id ?? determineNextRoundId(round.id, rounds);
    if (nextRoundId) {
      const advandingPlayerTourneysIds = getPlayerTourneysIds({round, players, stages, advancing: true});
      handleAddPlayersToRound(nextRoundId, advandingPlayerTourneysIds);
    }

    // find the first associated "redemption" round ID (if there is one)
    const childRounds = determineChildRounds(round.id, rounds);
    const upcomingRedemptionRound = round.parent_round_id === null ? childRounds[0] ?? null : null;
    if (upcomingRedemptionRound) {
      const redemptionPlayerTourneysIds = getPlayerTourneysIds({round, players, stages, advancing: false});
      handleAddPlayersToRound(upcomingRedemptionRound.id, redemptionPlayerTourneysIds);
    }

    const updatedRound = await handleUpdateRoundStatus(round.id, 'Complete');

    if (!nextRoundId) {
      // all rounds are now complete!
      handleUpdateTourneyStatus(tourneyId, 'Complete');
    }
    return { updatedRound };
  } catch (error) {
    console.error('Failed to end round:', error);
    throw error;
  }
}

type PlayerRoundWithScore = [number, number]; // [playerRoundId, score]

interface GetPlayerTourneysOptions {
  round: Round;
  players: PlayerRound[];
  stages: Stage[];
  advancing?: boolean; // true = advancing players, false = non-advancing players
}

function getPlayerTourneysIds({
  round,
  players,
  stages,
  advancing = true,
}: GetPlayerTourneysOptions): number[] {
  const rankings: PlayerRoundWithScore[] = calculatePlayerRankingsInRound({ players, stages });

  // Determine cutoff index
  const cutoff = round.players_advancing > rankings.length ? rankings.length : round.players_advancing;

  // Slice rankings based on advancing flag
  const selectedRankings = advancing ? rankings.slice(0, cutoff) : rankings.slice(cutoff);

  // Map playerRoundId -> player_tourney_id
  const idMap = Object.fromEntries(players.map(p => [p.id, p.player_tourney_id]));

  // Return just the player_tourney_ids
  return selectedRankings.map(([playerRoundId]) => idMap[playerRoundId] ?? playerRoundId);
}