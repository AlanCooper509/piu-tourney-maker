import { useState } from 'react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'

import { handleAddPlayerToRound } from '../../handlers/handleAddPlayerToRound'
import EditablePlayerRow from './EditablePlayerRow'
import AddPlayer from '../players/AddPlayer'
import { toaster } from '../ui/toaster'

import type { PlayerRound } from '../../types/PlayerRound'
import type { Round } from '../../types/Round'

interface PlayersListProps {
  round: Round | null
  players: PlayerRound[] | null
  setPlayers: React.Dispatch<React.SetStateAction<PlayerRound[]>>
  tourneyId: number
  loading: boolean
  error: Error | null
  admin: boolean
  loadingAdmin: boolean
}

export function PlayersList({ round, players, setPlayers, tourneyId, loading, error, admin, loadingAdmin }: PlayersListProps) {
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
    <Box>
      <Heading mb={2}>Players</Heading>
      {loading && <Text>Loading players...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      <VStack align="center" justify="center" gap={0}>
        {!loading && !error && players?.length ? (
          players.map(p => (
            <EditablePlayerRow
              key={p.id}
              player={p}
              admin={admin}
              removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
            />
          ))
        ) : (
          !loading && !error && <Text>No players found.</Text>
        )}
      </VStack>
      {!loadingAdmin && admin && <AddPlayer onAdd={onAddPlayer} loading={addingPlayer} />}
    </Box>
  )
}