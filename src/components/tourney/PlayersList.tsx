import { Box, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import { useState } from 'react';

import AddPlayer from '../players/AddPlayer';
import EditablePlayerRow from './EditablePlayerRow';
import { handleAddPlayerToTourney } from '../../handlers/handleAddPlayerToTourney';
import { toaster } from "../../components/ui/toaster";
import { useCurrentTourney } from '../../context/CurrentTourneyContext';
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";

import type { PlayerTourney } from '../../types/PlayerTourney';

interface PlayersListProps {
  players: PlayerTourney[] | null;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerTourney[]>>;
  loading: boolean;
  error: Error | null;
}

export function PlayersList({ players, setPlayers, loading, error }: PlayersListProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney( tourney?.id ?? undefined );
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newName, setNewName] = useState("");

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
  const columnCount = Math.min(Math.max(players?.length || 1, 1), 4);
  return (
    <>
      <Box>
        <HStack mb={2} justifyContent="center" alignItems="center">
          <Heading mb={2}>Players</Heading>
          {!loadingTourneyAdminStatus && isTourneyAdmin &&
            <AddPlayer
              onAdd={onAddPlayer}
              newName={newName}
              setNewName={setNewName}
              loading={addingPlayer}
            />
          }
        </HStack>
        {loading && <Text>Loading players...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        <SimpleGrid columns={[1,1,2,columnCount]} gap={[0, 0, 3, 5]} mb={2}>
            {!loading && !error && players?.length ? (
              players.map(p => (
                <EditablePlayerRow
                  key={p.id}
                  player={p}
                  updatePlayer={updatePlayer}
                  removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
                />
              ))
            ) : (
              !loading && !error && <Text>No players yet.</Text>
            )}
        </SimpleGrid>
      </Box>
    </>
  );
}