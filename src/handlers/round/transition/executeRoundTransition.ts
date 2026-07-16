import handleUpdateRoundStatus from '../handleUpdateRoundStatus';
import { handleAddPlayersToRound } from '../handleAddPlayersToRound';
import { handleUpdateTourneyStatus } from '../../handleUpdateTourneyStatus';
import { handleUpdateRoundName } from '../handleUpdateRoundName';
import { formatRoundName } from '../../../helpers/formatRoundName';
import { getRoundsInTourney } from '../../../helpers/getRoundsInTourney';
import getPlayersInRound from '../../../helpers/getPlayersInRound';

import type { Round } from '../../../types/Round';
import type { TourneyType } from '../../../types/Tourney';
import type { PlayerRound } from '../../../types/PlayerRound';

interface PlayerRankPair {
  playerTourneyId: number;
  sortOrder: number;
}

interface TransitionProps {
  tourneyId: number;
  round: Round;
  tourneyType: TourneyType | null;
  advancingPlayers: PlayerRankPair[];
  nonAdvancingPlayers: PlayerRankPair[];
}

function getRoundFromId(roundId: number, rounds: Round[]): Round | undefined {
  return rounds.find(r => r.id === roundId);
}

function determineChildRounds(roundId: number, rounds: Round[]): Round[] {
  return rounds.filter(r => r.parent_round_id === roundId);
}

function renameRoundWithPlayerNames(round: Round | undefined, players: PlayerRound[] | null) {
  if (!round || !players) return;
  const playerNames = players.map(p => p.player_tourneys?.player_name).filter(Boolean);
  const updatedName = formatRoundName(round.name, playerNames);
  handleUpdateRoundName(round.id, updatedName);
}

export async function executeRoundTransition({
  tourneyId,
  round,
  tourneyType,
  advancingPlayers,
  nonAdvancingPlayers,
}: TransitionProps) {
  // fetch rounds associated with tourney for progression mapping
  const rounds = await getRoundsInTourney(tourneyId);

  // winner(s) path
  const nextRoundId = round.next_round_id ?? null;
  if (nextRoundId && advancingPlayers.length > 0) {
    await handleAddPlayersToRound(advancingPlayers, nextRoundId);
  }

  // (optional) redemption path
  const childRounds = determineChildRounds(round.id, rounds);
  const upcomingRedemptionRound = round.parent_round_id === null ? childRounds[0] ?? null : null;
  if (upcomingRedemptionRound && nonAdvancingPlayers.length > 0) {
    await handleAddPlayersToRound(nonAdvancingPlayers, upcomingRedemptionRound.id);
  }

  // (optional) loser(s) path
  const upcomingLoserRoundId = round.lost_next_round_id;
  if (upcomingLoserRoundId && nonAdvancingPlayers.length > 0) {
    await handleAddPlayersToRound(nonAdvancingPlayers, upcomingLoserRoundId);
  }

  // handle Double Elimination dynamic naming updates
  if (tourneyType === "Double Elimination") {
    if (nextRoundId) {
      const nextRoundPlayers = await getPlayersInRound(nextRoundId);
      renameRoundWithPlayerNames(getRoundFromId(nextRoundId, rounds), nextRoundPlayers);
    }
    if (upcomingLoserRoundId) {
      const upcomingLoserRoundPlayers = await getPlayersInRound(upcomingLoserRoundId);
      renameRoundWithPlayerNames(getRoundFromId(upcomingLoserRoundId, rounds), upcomingLoserRoundPlayers);
    }
  }

  // complete current round & check/update tourney completion status
  const updatedRound = await handleUpdateRoundStatus(round.id, 'Complete');
  rounds[rounds.findIndex(r => r.id === updatedRound[0].id)] = updatedRound[0];
  
  if (rounds.every(r => r.status === 'Complete')) {
    await handleUpdateTourneyStatus(tourneyId, 'Complete');
  }

  return { updatedRound };
}