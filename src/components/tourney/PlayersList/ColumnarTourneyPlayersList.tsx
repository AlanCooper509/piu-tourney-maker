import { Box, Center, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';

import AddPlayer from '../../players/AddPlayer';
import BulkAddPlayers from '../../players/BulkAddPlayers';
import EditablePlayerRow from '../EditablePlayerRow';
import MissingPlayersWarning from '../MissingPlayersWarning';
import { handleAddPlayerToTourney, handleAddPlayersToTourney } from '../../../handlers/handleAddPlayerToTourney';
import { toaster } from "../../ui/toaster";
import { useCurrentTourney } from '../../../context/CurrentTourneyContext';
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";

import type { PlayerTourney } from '../../../types/PlayerTourney';
import type { PlayerRound } from '../../../types/PlayerRound';

interface ColumnarTourneyPlayersListProps {
  players: PlayerTourney[] | null;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerTourney[]>>;
  roundPlayers: PlayerRound[];
  loadingRoundPlayers: boolean;
  loading: boolean;
  error: Error | null;
}

export function ColumnarTourneyPlayersList({ players, setPlayers, roundPlayers, loadingRoundPlayers, loading, error }: ColumnarTourneyPlayersListProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney( tourney?.id ?? undefined );
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newName, setNewName] = useState("");

  // Tourney players not yet added to any round in this tourney
  const missingPlayers = useMemo(() => {
    const roundPlayerTourneyIds = new Set(roundPlayers.map((rp) => rp.player_tourney_id));
    return (players ?? []).filter((p) => !roundPlayerTourneyIds.has(p.id));
  }, [players, roundPlayers]);

  const onAddPlayer = async (name: string, seed: number | null) => {
    if (!tourney) return;    
    try {
      setAddingPlayer(true);
      const playerExists = players?.some((p) => p.player_name.toLowerCase() === name.toLowerCase());
      if (playerExists) {
        throw new Error(`Player "${name}" already exists in this tournament.`);
      }
      const newPlayer = await handleAddPlayerToTourney(tourney.id, name, seed);
      
      setPlayers((prev: PlayerTourney[]) => {
        const existingList = prev ?? [];
        if (existingList.some((p) => p.id === newPlayer.id)) return existingList;
        return [...existingList, newPlayer];
      });
      
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

  const existingPlayerNames = useMemo(
    () => new Set((players ?? []).map((p) => p.player_name.toLowerCase())),
    [players]
  );

  const onBulkAddPlayers = async (entries: { name: string; seed: number | null }[]) => {
    if (!tourney) return;
    try {
      setAddingPlayer(true);
      const newPlayers = await handleAddPlayersToTourney(tourney.id, entries);

      setPlayers((prev: PlayerTourney[]) => {
        const existingList = prev ?? [];
        const existingIds = new Set(existingList.map((p) => p.id));
        return [...existingList, ...newPlayers.filter((p) => !existingIds.has(p.id))];
      });

      toaster.create({
        title: "Players Added",
        description: `Added ${newPlayers.length} player${newPlayers.length === 1 ? "" : "s"} successfully.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to add players",
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

  const sortedPlayers = players ? [...players].sort((a, b) => {
    const seedA = a.seed;
    const seedB = b.seed;

    if (seedA !== null && seedA !== undefined && seedB !== null && seedB !== undefined) {
      return seedA - seedB;
    }

    if (seedA !== null && seedA !== undefined) return -1;
    if (seedB !== null && seedB !== undefined) return 1;
    return a.player_name.localeCompare(b.player_name);
  }) : [];

return (
    <>
      <Box>
        <HStack mb={2} justifyContent="center" alignItems="center">
          <Heading mb={2}>Players</Heading>
          {!loadingTourneyAdminStatus && isTourneyAdmin &&
            <>
              <AddPlayer
                onAdd={onAddPlayer}
                newName={newName}
                setNewName={setNewName}
                loading={addingPlayer}
              />
              <BulkAddPlayers
                onBulkAdd={onBulkAddPlayers}
                existingPlayerNames={existingPlayerNames}
                loading={addingPlayer}
              />
            </>
          }
        </HStack>

        {!loadingTourneyAdminStatus && isTourneyAdmin && !loadingRoundPlayers && (
          <Box mb={2}>
            <MissingPlayersWarning missingPlayers={missingPlayers} />
          </Box>
        )}

        {loading && <Text>Loading players...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        
        <SimpleGrid columns={[1, 1, 2, columnCount]} gap={[0, 0, 3, 5]} mb={2}>
            {!loading && !error && sortedPlayers.length ? (
              sortedPlayers.map(p => (
                <EditablePlayerRow
                  key={p.id}
                  player={p}
                  updatePlayer={updatePlayer}
                  removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
                />
              ))
            ) : (
              !loading && !error && (
                <Center w="100%" mt={2}>
                  <Text>No players yet.</Text>
                </Center>
              )
            )}
        </SimpleGrid>
      </Box>
    </>
  );
}