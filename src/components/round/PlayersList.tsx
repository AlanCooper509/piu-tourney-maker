import { useMemo, useState } from 'react'
import { Box, Center, createListCollection, Heading, HStack, Text, useFilter, VStack } from '@chakra-ui/react'

import { handleAddPlayerToRound } from '../../handlers/round/handleAddPlayerToRound'
import DeletablePlayerRow from './DeletablePlayerRow'
import AddPlayer from '../players/AddPlayer'
import { toaster } from '../ui/toaster'
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from '../../context/CurrentTourneyContext'

import type { PlayerRound } from '../../types/PlayerRound'
import type { PlayerTourney } from '../../types/PlayerTourney'
import type { Round } from '../../types/Round'
import type { Stage } from '../../types/Stage'

interface PlayersListProps {
  round: Round | null
  players: PlayerRound[] | null
  setPlayers: React.Dispatch<React.SetStateAction<PlayerRound[]>>
  stages: Stage[] | null
  tourneyPlayers: PlayerTourney[] | null;
  loading: boolean
  error: Error | null
}

export function PlayersList({ round, players, setPlayers, stages, tourneyPlayers, loading, error }: PlayersListProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newName, setNewName] = useState("");

  const onAddPlayer = async (name: string) => {
    if (!round) return;
    try {
      setAddingPlayer(true);
      const newPlayer = await handleAddPlayerToRound(name, round.id, Number(tourney?.id));
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

  // Sort players using the player_rounds.sort_order column (null/undefined values are placed at the end)
  const sortedPlayers = useMemo(() => {
    if (!players) return [];
    return [...players].sort((a, b) => {
      const aVal = a.sort_order;
      const bVal = b.sort_order;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      return bVal - aVal; // sorted greatest to least by default (use-case was for BITE9)
    });
  }, [players]);

  const collection = usePlayerCollection({ players, tourneyPlayers, searchTerm: newName });

  return (
    <Box w={"md"}>
      <HStack mb={2} justifyContent="center">
        <Heading mb={2}>Players</Heading>
        {!loadingTourneyAdminStatus && isTourneyAdmin &&
          <AddPlayer
            onAdd={onAddPlayer}
            newName={newName}
            setNewName={setNewName}
            loading={addingPlayer}
            collection={collection}
            hideSeed={true}
            text={"Add Player"}
          />
        }
      </HStack>
      {loading && <Text>Loading players...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      <VStack align={{ base: "center", md: "center", lg: "start" }} justify="center" gap={0}>
        {!loading && !error && sortedPlayers.length ? (
          sortedPlayers.map(p => p ? (
            <DeletablePlayerRow
              key={p.id}
              player={p}
              stages={stages}
              removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
            />
          ) : null)
        ) : (
          !loading && !error && (
            <Center w="100%" mt={2}>
              <Text>No players yet.</Text>
            </Center>
          )
        )}
      </VStack>
    </Box>
  )
}

interface UsePlayerCollectionProps {
  players: any[] | null;
  tourneyPlayers: any[] | null;
  searchTerm: string;
}
function usePlayerCollection({ players, tourneyPlayers, searchTerm }: UsePlayerCollectionProps) {
  const { contains } = useFilter({ sensitivity: "base" });

  // 1. Memoize existing names
  const roundPlayerNames = useMemo(() => {
    if (!players) return new Set<string>();
    return new Set(players.map((p) => p.player_tourneys.player_name));
  }, [players]);

  // 2. Memoize the base list (filtered by round exclusion)
  const playerOptions = useMemo(() => {
    if (!tourneyPlayers) return [];
    return tourneyPlayers
      .filter((p) => !roundPlayerNames.has(p.player_name))
      .map((p) => ({ label: p.player_name, value: p.player_name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tourneyPlayers, roundPlayerNames]);

  // 3. Memoize the final collection (filtered by search term)
  const collection = useMemo(() => {
    const filtered = !searchTerm
      ? playerOptions
      : playerOptions.filter((item) => contains(item.label, searchTerm));

    return createListCollection({
      items: filtered,
    });
  }, [playerOptions, searchTerm, contains]);

  return collection;
}