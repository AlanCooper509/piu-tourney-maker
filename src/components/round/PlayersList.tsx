import { useState } from 'react'
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react'

import { handleAddPlayerToRound } from '../../handlers/handleAddPlayerToRound'
import DeletablePlayerRow from './DeletablePlayerRow'
import AddPlayer from '../players/AddPlayer'
import { toaster } from '../ui/toaster'

import type { PlayerRound } from '../../types/PlayerRound'
import type { Round } from '../../types/Round'
import type { Stage } from '../../types/Stage'

interface PlayersListProps {
  round: Round | null
  players: PlayerRound[] | null
  setPlayers: React.Dispatch<React.SetStateAction<PlayerRound[]>>
  stages: Stage[] | null
  tourneyId: number
  loading: boolean
  error: Error | null
  admin: boolean
  loadingAdmin: boolean
}

export function PlayersList({ round, players, setPlayers, stages, tourneyId, loading, error, admin, loadingAdmin }: PlayersListProps) {
  const [addingPlayer, setAddingPlayer] = useState(false);

  const onAddPlayer = async (name: string) => {
    if (!round) return;
    try {
      setAddingPlayer(true);
      const newPlayer = await handleAddPlayerToRound(name, round.id, tourneyId);
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

  return (
    <Box w={"md"}>
      <HStack mb={2} justifyContent="center">
        <Heading mb={2}>Players</Heading>
        {!loadingAdmin && admin && <AddPlayer onAdd={onAddPlayer} loading={addingPlayer} />}
      </HStack>
      {loading && <Text>Loading players...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      <VStack align={{ base: "center", md: "center", lg: "start" }} justify="center" gap={0}>
        {!loading && !error && players?.length ? (
          players.map(p => (
            <DeletablePlayerRow
              key={p.id}
              player={p}
              stages={stages}
              admin={admin}
              removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
            />
          ))
        ) : (
          !loading && !error && <Text>No players found.</Text>
        )}
      </VStack>
    </Box>
  )
}