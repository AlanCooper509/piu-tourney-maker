import handleUpdateRoundStatus from '../handleUpdateRoundStatus';
import { handleAddPlayersToRound } from '../handleAddPlayersToRound';
import { handleUpdateTourneyStatus } from '../../handleUpdateTourneyStatus';
import { handleUpdateRoundName } from '../handleUpdateRoundName';
import { formatRoundName } from '../../../helpers/formatRoundName';
import { getRoundsInTourney } from '../../../helpers/getRoundsInTourney';
import { getRoundAdvancementsInTourney } from '../../../helpers/getRoundAdvancementsInTourney';
import { resolveAdvancementDestination } from '../../../helpers/resolveAdvancementDestination';
import getPlayersInRound from '../../../helpers/getPlayersInRound';
import { isBracketFormat } from '../../../helpers/isBracketFormat';

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
  rankedPlayers: PlayerRankPair[];
}

function getRoundFromId(roundId: number, rounds: Round[]): Round | undefined {
  return rounds.find(r => r.id === roundId);
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
  rankedPlayers,
}: TransitionProps) {
  // fetch rounds and advancement rules associated with tourney for progression mapping
  const rounds = await getRoundsInTourney(tourneyId);
  const roundAdvancements = await getRoundAdvancementsInTourney(tourneyId);
  const advancementsForRound = roundAdvancements.filter(a => a.round_id === round.id);

  // Group ranked players by resolved destination round. A rank with no matching
  // advancement rule is eliminated and is not added to any round.
  const playersByDestination = new Map<number, PlayerRankPair[]>();
  for (const player of rankedPlayers) {
    const destinationRoundId = resolveAdvancementDestination(player.sortOrder, advancementsForRound);
    if (destinationRoundId == null) continue;

    const group = playersByDestination.get(destinationRoundId) ?? [];
    group.push(player);
    playersByDestination.set(destinationRoundId, group);
  }

  for (const [destinationRoundId, players] of playersByDestination) {
    await handleAddPlayersToRound(players, destinationRoundId);
  }

  // handle bracket-format dynamic naming updates
  if (isBracketFormat(tourneyType)) {
    for (const destinationRoundId of playersByDestination.keys()) {
      const destinationPlayers = await getPlayersInRound(destinationRoundId);
      renameRoundWithPlayerNames(getRoundFromId(destinationRoundId, rounds), destinationPlayers);
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
