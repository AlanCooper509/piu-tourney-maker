import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import AddPlayer from '../players/AddPlayer';
import EditablePlayerRow from './EditablePlayerRow';
import { handleAddPlayerToTourney } from '../../handlers/handleAddPlayerToTourney';
import { toaster } from "../../components/ui/toaster";

import type { PlayerTourney } from '../../types/PlayerTourney';
import type { Tourney } from '../../types/Tourney';

interface PlayersListProps {
  tourney: Tourney | null;
  players: PlayerTourney[] | null;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerTourney[]>>;
  loading: boolean;
  error: Error | null;
  admin: boolean;
  loadingAdmin: boolean;
}

export function PlayersList({ tourney, players, setPlayers, loading, error, admin, loadingAdmin }: PlayersListProps) {
  const [addingPlayer, setAddingPlayer] = useState(false);

  const onAddPlayer = async (name: string) => {
    if (!tourney) return;
    try {
      setAddingPlayer(true);
      const newPlayer = await handleAddPlayerToTourney(tourney.id, name);
      setPlayers((prev: PlayerTourney[]) => [...(prev ?? []), newPlayer]);
      toaster.create({
        title: "Player Added",
        description: `Player "${newPlayer.player_name}" was added successfully.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: err.message.includes("already exists") ? "Duplicate Player" : "Failed to add player",
        description: err.message,
        type: "error",
        closable: true,
      });
    } finally {
      setAddingPlayer(false);
    }
  };

  const updatePlayer = (updated: PlayerTourney) => {
    setPlayers((prev) =>
      prev?.map(p => (p.id === updated.id ? updated : p)) ?? []
    );
  };

  return (
    <>
      <Box>
        <HStack mb={2} justifyContent="center" alignItems="center">
          <Heading mb={2}>Players</Heading>
          {!loadingAdmin && admin && <AddPlayer onAdd={onAddPlayer} loading={addingPlayer} />}
        </HStack>
        {loading && <Text>Loading players...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        <VStack align="center" justify="center" gap={0}>
          {!loading && !error && players?.length ? (
            players.map(p => (
              <EditablePlayerRow
                key={p.id}
                player={p}
                admin={admin}
                updatePlayer={updatePlayer}
                removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
              />
            ))
          ) : (
            !loading && !error && <Text>No players found.</Text>
          )}
        </VStack>
      </Box>
    </>
  );
}