import handleCheckTourneyStatus from '../handleCheckTourneyStatus';
import handleUpdateRoundStatus from './handleUpdateRoundStatus';
import calculatePlayerRankingsInRound from '../../helpers/calculatePlayerRankingsInRound';
import {handleAddPlayersToRound} from './handleAddPlayersToRound';
import { handleUpdateTourneyStatus } from '../handleUpdateTourneyStatus';
import { handleUpdateRoundName } from './handleUpdateRoundName';
import { getRoundsInTourney } from '../../helpers/getRoundsInTourney';
import getStagesInRound from '../../helpers/getstagesInRound';
import getPlayersInRound from '../../helpers/getPlayersInRound';

import type { PlayerRound } from '../../types/PlayerRound';
import type { Round } from '../../types/Round';
import type { Stage } from '../../types/Stage';
import type { TourneyType } from '../../types/Tourney';

interface handleStartRoundProps {
  tourneyId: number;
  round: Round;
  tourneyType: TourneyType | null;
}

function getRoundFromId(roundId: number, rounds: Round[]): Round | undefined {
  return rounds.find(r => r.id === roundId);
}

function determineChildRounds(roundId: number, rounds: Round[]): Round[] {
  return rounds.filter(r => r.parent_round_id === roundId);
}

export default async function handleEndRound({ tourneyId, round, tourneyType }: handleStartRoundProps) {  
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
    const nextRoundId = round.next_round_id ?? null;
    if (nextRoundId) {
      const advandingPlayerTourneysIds = getPlayerTourneysIds({round, players, stages, advancing: true});
      await handleAddPlayersToRound(advandingPlayerTourneysIds, nextRoundId);
    }

    // find the first associated "redemption" round ID (if there is one)
    const childRounds = determineChildRounds(round.id, rounds);
    const upcomingRedemptionRound = round.parent_round_id === null ? childRounds[0] ?? null : null;
    if (upcomingRedemptionRound) {
      const redemptionPlayerTourneysIds = getPlayerTourneysIds({round, players, stages, advancing: false});
      await handleAddPlayersToRound(redemptionPlayerTourneysIds, upcomingRedemptionRound.id);
    }

    // find the next loser round ID (if there is one)
    const upcomingLoserRoundId = round.lost_next_round_id;
    if (upcomingLoserRoundId) {
      const loserPlayerTourneysIds = getPlayerTourneysIds({round, players, stages, advancing: false});
      await handleAddPlayersToRound(loserPlayerTourneysIds, upcomingLoserRoundId);
    }

    // if tournament type is double elimination, rename the next winner and loser round (if there is one) 
    // to include player names
    if (tourneyType === "Double Elimination") {
      if (nextRoundId) {
        const nextRoundPlayers = await getPlayersInRound(nextRoundId);
        const nextRound = getRoundFromId(nextRoundId, rounds);
        renameRoundWithPlayerNames(nextRound, nextRoundPlayers);
      }
      if (upcomingLoserRoundId) {
        const upcomingLoserRoundPlayers = await getPlayersInRound(upcomingLoserRoundId);
        const existingRound = getRoundFromId(upcomingLoserRoundId, rounds);
        renameRoundWithPlayerNames(existingRound, upcomingLoserRoundPlayers);
      }
    }

    const updatedRound = await handleUpdateRoundStatus(round.id, 'Complete');
    rounds[rounds.findIndex(r => r.id === updatedRound[0].id)] = updatedRound[0];
    if (rounds.every(round => round.status === 'Complete')) {
      handleUpdateTourneyStatus(tourneyId, 'Complete');
    }

    return { updatedRound };
  } catch (error) {
    console.error('Failed to end round:', error);
    throw error;
  }
}

interface GetPlayerTourneysOptions {
  round: Round;
  players: PlayerRound[];
  stages: Stage[];
  advancing?: boolean; // true = advancing players, false = non-advancing players
}

function renameRoundWithPlayerNames(round: Round | undefined, players: PlayerRound[] | null) {
  if (!round || !players || players.length === 0) return;
  const existingName = round.name;
  const separator = ": ";
  let updatedName = existingName.split(separator)[0] + separator;

  if (players.length === 1) {
    const playerName = players[0].player_tourneys.player_name;
    updatedName += playerName + " vs. ??";
  } else {
    const playerNames = players.map(p => p.player_tourneys.player_name).join(" vs. ");
    updatedName += playerNames;
  }
  handleUpdateRoundName(round.id, updatedName);
}

function getPlayerTourneysIds({
  round,
  players,
  stages,
  advancing = true,
}: GetPlayerTourneysOptions): number[] {

  const { rankings } = calculatePlayerRankingsInRound({ players, stages, round });

  // Determine cutoff index
  const cutoff = round.players_advancing > rankings.length
    ? rankings.length
    : round.players_advancing;

  // Slice rankings based on advancing flag
  const selectedRankings = advancing ? rankings.slice(0, cutoff) : rankings.slice(cutoff);

  // Map playerRoundId -> player_tourney_id
  const idMap = Object.fromEntries(players.map(p => [p.id, p.player_tourney_id]));

  // Return just the player_tourney_ids
  return selectedRankings.map(([playerRoundId]) => idMap[playerRoundId] ?? playerRoundId);
}