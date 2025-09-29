import { useState } from 'react'
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react'

import { handleAddPlayerToRound } from '../../handlers/handleAddPlayerToRound'
import DeletablePlayerRow from './DeletablePlayerRow'
import AddPlayer from '../players/AddPlayer'
import { toaster } from '../ui/toaster'
import { useIsAdminForTourney } from '../../context/TourneyAdminContext'
import { useCurrentTourney } from '../../context/CurrentTourneyContext'
import calculatePlayerRankingsInRound from '../../helpers/calculatePlayerRankingsInRound'

import type { PlayerRound } from '../../types/PlayerRound'
import type { Round } from '../../types/Round'
import type { Stage } from '../../types/Stage'

interface PlayersListProps {
  round: Round | null
  players: PlayerRound[] | null
  setPlayers: React.Dispatch<React.SetStateAction<PlayerRound[]>>
  stages: Stage[] | null
  loading: boolean
  error: Error | null
}

export function PlayersList({ round, players, setPlayers, stages, loading, error }: PlayersListProps) {
  const { tourneyId, setTourneyId: _setTourneyId } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(Number(tourneyId));

  const [addingPlayer, setAddingPlayer] = useState(false);

  const onAddPlayer = async (name: string) => {
    if (!round) return;
    try {
      setAddingPlayer(true);
      const newPlayer = await handleAddPlayerToRound(name, round.id, Number(tourneyId));
      setPlayers((prev: PlayerRound[]) => [...(prev ?? []), newPlayer]);
      toaster.create({
        title: "Player Added",
        description: `Player "${newPlayer.player_tourneys.player_name}" was added successfully to Round: "${round.name}".`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: err.message.includes("already registered") ? "Duplicate Player" : "Failed to add player",
        description: err.message,
        type: "error",
        closable: true,
      });
    } finally {
      setAddingPlayer(false);
    }
  };

  if (round && round.status === "Complete" && players && stages) {
    players = sortPlayers(players, stages);
  }

  return (
    <Box w={"md"}>
      <HStack mb={2} justifyContent="center">
        <Heading mb={2}>Players</Heading>
        {!loadingTourneyAdminStatus && isTourneyAdmin && <AddPlayer onAdd={onAddPlayer} loading={addingPlayer} />}
      </HStack>
      {loading && <Text>Loading players...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      <VStack align={{ base: "center", md: "center", lg: "start" }} justify="center" gap={0}>
        {!loading && !error && players?.length ? (
          (players).map(p => p ? (
              <DeletablePlayerRow
                key={p.id}
                player={p}
                stages={stages}
                removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
              />
            ): null)
        ) : (
          !loading && !error && <Text>No players found.</Text>
        )}
      </VStack>
    </Box>
  )
}

function sortPlayers(players: PlayerRound[], stages: Stage[]) {
  const rankings = calculatePlayerRankingsInRound({ players, stages });
  let sortedPlayers = [];
  for (let i = 0; i < rankings.length; i++) {
    const playerId = rankings[i][0];
    const player = players?.find(p => p.id === playerId);
    if (player) sortedPlayers.push(player);
  }
  return sortedPlayers;
}