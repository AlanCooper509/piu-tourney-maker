import { Box, Center, Heading, HStack, Text, VStack, Card } from '@chakra-ui/react';
import React, { useState } from 'react';

import AddPlayer from '../../players/AddPlayer';
import EditablePlayerRow from '../EditablePlayerRow';
import { handleAddPlayerToTourney } from '../../../handlers/handleAddPlayerToTourney';
import { toaster } from "../../ui/toaster";
import { useCurrentTourney } from '../../../context/CurrentTourneyContext';
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";

import type { PlayerTourney } from '../../../types/PlayerTourney';

interface SidebarTourneyPlayersListProps {
  players: PlayerTourney[] | null;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerTourney[]>>;
  loading: boolean;
  error: Error | null;
}

export function SidebarTourneyPlayersList({ players, setPlayers, loading, error }: SidebarTourneyPlayersListProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newName, setNewName] = useState("");

  const onAddPlayer = async (name: string, seed: number | null) => {
    if (!tourney) return;    
    try {
      setAddingPlayer(true);
      const playerExists = players?.some((p) => p.player_name.toLowerCase() === name.toLowerCase());
      if (playerExists) {
        throw new Error(`Player "${name}" already exists in this tournament.`);
      }
      const newPlayer = await handleAddPlayerToTourney(tourney.id, name, seed);
      
      setPlayers((prev) => {
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

  const updatePlayer = (updated: PlayerTourney) => {
    setPlayers((prev) =>
      prev?.map(p => (p.id === updated.id ? updated : p)) ?? []
    );
  };

  const sortedPlayers = players ? [...players] : [];

  return (
    <Box 
      w={{ base: "100%", lg: "300px" }}
      minW={{ md: "180px", lg: "260px" }}
      h="fit-content"
    >
      {/* Header Area remains outside as a section title */}
      <HStack mb={3} justifyContent="center" alignItems="center" px={1}>
        <Heading size="md">Players</Heading>
        {!loadingTourneyAdminStatus && isTourneyAdmin && (
          <AddPlayer
            onAdd={onAddPlayer}
            newName={newName}
            setNewName={setNewName}
            loading={addingPlayer}
          />
        )}
      </HStack>

      {loading && <Text fontSize="sm" color="gray.400" mb={2} px={1}>Loading players...</Text>}
      {error && <Text fontSize="sm" color="red.400" mb={2} px={1}>Error: {error.message}</Text>}

      {!loading && !error && sortedPlayers.length ? (
        <Card.Root variant="outline" size="sm">
          <Card.Body p={1.5}>
            <VStack 
              align="stretch" 
              gap={0}
              maxH={{ base: "40vh", md: "none" }}
              overflowY="auto"
            >
              {sortedPlayers.map((p, index) => (
                <Box 
                  key={p.id} 
                  p={1.5} 
                  borderRadius="sm"
                  borderTopWidth={index > 0 ? "1px" : "0px"}
                  borderColor="border.subtle"
                  _hover={{ bg: "whiteAlpha.50" }}
                  transition="background 0.2s"
                >
                  <EditablePlayerRow
                    player={p}
                    updatePlayer={updatePlayer}
                    removePlayer={(id) => setPlayers(prev => (prev ? prev.filter(p => p.id !== id) : []))}
                  />
                </Box>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        !loading && !error && (
          <Center w="100%" py={4}>
            <Text fontSize="sm" color="gray.500" fontStyle="italic">No players yet.</Text>
          </Center>
        )
      )}
    </Box>
  );
}