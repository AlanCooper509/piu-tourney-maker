import { useState, useMemo } from 'react'
import { Box, Center, createListCollection, Flex, Heading, Text, useFilter } from '@chakra-ui/react'

import { handleAddPlayerToRound } from '../../handlers/round/handleAddPlayerToRound'
import DeletablePlayerRow from './DeletablePlayerRow'
import AddPlayer from '../players/AddPlayer'
import { toaster } from '../ui/toaster'
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from '../../context/CurrentTourneyContext'
import calculatePlayerRankingsInRound from '../../helpers/calculatePlayerRankingsInRound'

import type { PlayerRound } from '../../types/PlayerRound'
import type { PlayerTourney } from '../../types/PlayerTourney'
import type { Round } from '../../types/Round'
import type { Stage } from '../../types/Stage'
import { PlayerRoundName } from '../players/PlayerRoundName'

interface PlayersH2HProps {
  round: Round | null
  players: PlayerRound[] | null
  setPlayers: React.Dispatch<React.SetStateAction<PlayerRound[]>>
  stages: Stage[] | null
  tourneyPlayers: PlayerTourney[] | null;
  loading: boolean
  error: Error | null
}

export function PlayersH2H({ round, players, setPlayers, stages, tourneyPlayers, loading, error }: PlayersH2HProps) {
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

  // Sort players if round is complete
  let managedPlayers = players ?? [];
  if (round && round.status === "Complete" && players && stages) {
    managedPlayers = sortPlayers(players, stages, round);
  }

  const collection = usePlayerCollection({ players: managedPlayers, tourneyPlayers, searchTerm: newName });

  const player1 = managedPlayers[0] || null;
  const player2 = managedPlayers[1] || null;

  if (loading) return <Text textAlign="center">Loading players...</Text>;
  if (error) return <Text color="red" textAlign="center">Error: {error.message}</Text>;

  return (
    <Box w="full" maxW="4xl" mx="auto" px={4} py={6}>
      <Heading size="lg" textAlign="center" mb={6}>Head-to-Head</Heading>
      <Flex
        position="relative"
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="center"
        gap={{ base: 2, md: 0 }}
      >
        {/* Left Side: Player 1 */}
        <Box
          flex={1}
          w="full"
          minW={0}
          maxW={{ base: isTourneyAdmin ? "xs" : "full", md: "full" }}
          display="flex"
          alignItems="center"
          justifyContent={{ base: "flex-start", md: "flex-end" }}
        >
          {!loadingTourneyAdminStatus && isTourneyAdmin ? (
            /* ==================== ADMIN VIEW ==================== */
            player1 ? (
              <DeletablePlayerRow
                player={player1}
                stages={stages}
                removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
              />
            ) : (
              <Box maxW="xs" w="full">
                <AddPlayer
                  onAdd={onAddPlayer}
                  newName={newName}
                  setNewName={setNewName}
                  loading={addingPlayer}
                  collection={collection}
                  hideSeed={true}
                />
              </Box>
            )
          ) : (
            /* ==================== END-USER VIEW ==================== */
            <PlayerRoundName playerRound={player1} color="red.solid" />
          )}
        </Box>

        {/* Middle vs Divider */}
        {isTourneyAdmin ? (
          <Center display={{ base: "none", md: "flex" }}
            mx={6}
            height="14"
            zIndex={2}
          >
            <Box width="2px" height="full" bg="gray.800" />
          </Center>
        ) : (
          <Center
            px={2}
            mx={{ base: 0, md: -4 }}
            my={{ base: -5, md: 0 }}
            zIndex={2}
            bg="gray.950"
            borderColor="gray.600"
            borderWidth="1px"
            transform="skewX(-20deg)"
            borderRadius="md"
            fontWeight="bold"
            fontSize="lg"
            color="fg.muted"
            userSelect="none"
          >
            <Text color="yellow.focusRing" transform="skewX(20deg)">VS</Text>
          </Center>
        )}

        {/* Right Side: Player 2 */}
        <Box
          flex={1}
          w="full"
          minW={0}
          maxW={{ base: isTourneyAdmin ? "xs" : "full", md: "full" }}
          display="flex"
          alignItems="center"
          justifyContent={{ base: "flex-end", md: "flex-start" }}
        >
          {!loadingTourneyAdminStatus && isTourneyAdmin ? (
            /* ==================== ADMIN VIEW ==================== */
            player2 ? (
              <DeletablePlayerRow
                player={player2}
                stages={stages}
                removePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
              />
            ) : managedPlayers.length < 2 ? (
              <Box maxW="xs" w="full">
                <AddPlayer
                  onAdd={onAddPlayer}
                  newName={newName}
                  setNewName={setNewName}
                  loading={addingPlayer}
                  collection={collection}
                  hideSeed={true}
                />
              </Box>
            ) : null
          ) : (
            /* ==================== END-USER VIEW ==================== */
            <PlayerRoundName playerRound={player2} color="blue.solid" />
          )}
        </Box>
      </Flex>
    </Box>
  )
}

function sortPlayers(players: PlayerRound[], stages: Stage[], round: Round) {
  const { rankings } = calculatePlayerRankingsInRound({ players, stages, round });
  let sortedPlayers = [];
  for (let i = 0; i < rankings.length; i++) {
    const playerId = rankings[i][0];
    const player = players?.find(p => p.id === playerId);
    if (player) sortedPlayers.push(player);
  }
  return sortedPlayers;
}

interface UsePlayerCollectionProps {
  players: any[] | null;
  tourneyPlayers: any[] | null;
  searchTerm: string;
}
function usePlayerCollection({ players, tourneyPlayers, searchTerm }: UsePlayerCollectionProps) {
  const { contains } = useFilter({ sensitivity: "base" });

  const roundPlayerNames = useMemo(() => {
    if (!players) return new Set<string>();
    return new Set(players.map((p) => p.player_tourneys.player_name));
  }, [players]);

  const playerOptions = useMemo(() => {
    if (!tourneyPlayers) return [];
    return tourneyPlayers
      .filter((p) => !roundPlayerNames.has(p.player_name))
      .map((p) => ({ label: p.player_name, value: p.player_name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tourneyPlayers, roundPlayerNames]);

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