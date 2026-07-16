import { useState, useMemo } from 'react'
import { Box, Center, createListCollection, Flex, Heading, Text, useFilter, VStack } from '@chakra-ui/react'

import { handleAddPlayerToRound } from '../../handlers/round/handleAddPlayerToRound'
import { handleDeletePlayerFromRound } from '../../handlers/round/handleDeletePlayerFromRound'
import AddPlayer from '../players/AddPlayer'
import { toaster } from '../ui/toaster'
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext"
import { useCurrentTourney } from '../../context/CurrentTourneyContext'
import calculatePlayerRankingsInRound from '../../helpers/calculatePlayerRankingsInRound'
import DialogForm from '../../components/ui/DialogForm'
import { PlayerRoundName } from '../players/PlayerRoundName'

import type { PlayerRound } from '../../types/PlayerRound'
import type { PlayerTourney } from '../../types/PlayerTourney'
import type { Round } from '../../types/Round'
import type { Stage } from '../../types/Stage'

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

  // Controlled modal hooks
  const [deletingPlayer, setDeletingPlayer] = useState<PlayerRound | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  const onDeletePlayerSubmit = async (): Promise<boolean> => {
    if (!deletingPlayer) return false;
    try {
      await handleDeletePlayerFromRound(deletingPlayer.id);
      setPlayers(prev => prev.filter(p => p.id !== deletingPlayer.id));
      toaster.create({
        title: "Player deleted",
        description: `"${deletingPlayer.player_tourneys.player_name}" was removed from the round.`,
        type: "success",
        closable: true,
      });
      setIsDeleteOpen(false);
      setDeletingPlayer(null);
      return true;
    } catch (err: any) {
      toaster.create({
        title: "Failed to delete player",
        description: err.message,
        type: "error",
        closable: true,
      });
      return false;
    }
  };

  const isPointsBased = Boolean(round?.points_per_stage);

  const scoringData = useMemo(() => {
    const totalsMap: Record<number, number> = {};
    const hasScoresMap: Record<number, boolean> = {};

    if (!players || !stages) {
      return { totalsMap, hasScoresMap };
    }

    // Initialize maps for all active players
    players.forEach(player => {
      totalsMap[player.id] = 0;
      hasScoresMap[player.id] = false;
    });

    const pointsScale = round?.points_per_stage
      ? round.points_per_stage.split(",").map(str => Number(str.trim()))
      : [];

    stages.forEach((stage) => {
      // Gather scores specifically for our active players
      const stageScores = players
        .map(p => {
          const matchedScore = stage.scores?.find(s => s.player_round_id === p.id);
          return {
            playerId: p.id,
            score: matchedScore && matchedScore.score !== undefined && matchedScore.score !== null
              ? Number(matchedScore.score)
              : null
          };
        });

      // Check if ANY of our active players are missing a score for this stage
      const isStageIncomplete = stageScores.some(item => item.score === null);

      // If a player hasn't played this stage yet, skip calculating points for it completely
      if (isStageIncomplete) {
        return;
      }

      // Keep track of which players have finalized scores counted toward their total
      stageScores.forEach(item => {
        hasScoresMap[item.playerId] = true;
      });

      if (isPointsBased && pointsScale.length > 0) {
        // --- POINTS-BASED LOCAL METRIC (Rank Highest to Lowest) ---
        const validScores = stageScores as { playerId: number; score: number }[];

        // Sort highest score to lowest
        validScores.sort((a, b) => b.score - a.score);
        validScores.forEach((item) => {
          // Find position for dense ranking (handling ties)
          const tieIndex = validScores.findIndex(x => x.score === item.score);
          const pointsAwarded = pointsScale[tieIndex] ?? 0;
          totalsMap[item.playerId] += pointsAwarded;
        });
      } else {
        // --- CUMULATIVE LOCAL METRIC ---
        stageScores.forEach(item => {
          if (item.score !== null) {
            totalsMap[item.playerId] += item.score;
          }
        });
      }
    });

    return { totalsMap, hasScoresMap };
  }, [players, stages, round, isPointsBased]);

  let managedPlayers = players ?? [];
  if (round && round.status === "Complete" && players && stages) {
    managedPlayers = sortPlayers(players, stages, round);
  }

  const collection = usePlayerCollection({ players: managedPlayers, tourneyPlayers, searchTerm: newName });

  const player1 = managedPlayers[0] || null;
  const player2 = managedPlayers[1] || null;

  if (loading) return <Text textAlign="center">Loading players...</Text>;
  if (error) return <Text color="red" textAlign="center">Error: {error.message}</Text>;

  const showAdminControls = !loadingTourneyAdminStatus && isTourneyAdmin;

  return (
    <Box w="full" maxW="4xl" mx="auto" px={4} pt={2} pb={6}>
      <Heading textAlign="center" mb={6}>Head-to-Head</Heading>
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
          maxW={{ base: showAdminControls ? "xs" : "full", md: "full" }}
          display="flex"
          alignItems="center"
          justifyContent={{ base: "flex-start", md: "flex-end" }}
        >
          {player1 ? (
            <PlayerRoundName
              playerRound={player1}
              color="red.solid"
              score={scoringData.hasScoresMap[player1.id] ? scoringData.totalsMap[player1.id].toLocaleString() : "-"}
              scoreSuffix={isPointsBased && scoringData.hasScoresMap[player1.id] ? "pts" : undefined}
              flipped={true}
              onDelete={showAdminControls ? () => {
                setDeletingPlayer(player1);
                setIsDeleteOpen(true);
              } : undefined}
            />
          ) : showAdminControls ? (
            <Box maxW="xs" w="full">
              <AddPlayer
                onAdd={onAddPlayer}
                newName={newName}
                setNewName={setNewName}
                loading={addingPlayer}
                collection={collection}
                hideSeed={true}
                text="Add Player"
              />
            </Box>
          ) : null}
        </Box>

        {/* Middle vs Divider */}
        {showAdminControls ? (
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
            my={{ base: -4.5, md: 0 }}
            zIndex={2}
            bg="gray.950"
            borderColor="gray.600"
            borderWidth="1px"
            transform="skewX(-20deg)"
            borderRadius="md"
            fontWeight="bold"
            fontSize="md"
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
          maxW={{ base: showAdminControls ? "xs" : "full", md: "full" }}
          display="flex"
          alignItems="center"
          justifyContent={{ base: "flex-end", md: "flex-start" }}
        >
          {player2 ? (
            <PlayerRoundName
              playerRound={player2}
              color="blue.solid"
              score={scoringData.hasScoresMap[player2.id] ? scoringData.totalsMap[player2.id].toLocaleString() : "-"}
              scoreSuffix={isPointsBased && scoringData.hasScoresMap[player2.id] ? "pts" : undefined}
              flipped={false}
              onDelete={showAdminControls ? () => {
                setDeletingPlayer(player2);
                setIsDeleteOpen(true);
              } : undefined}
            />
          ) : (showAdminControls && managedPlayers.length < 2) ? (
            <Box maxW="xs" w="full">
              <AddPlayer
                onAdd={onAddPlayer}
                newName={newName}
                setNewName={setNewName}
                loading={addingPlayer}
                collection={collection}
                hideSeed={true}
                text="Add Player"
              />
            </Box>
          ) : null}
        </Box>
      </Flex>

      {/* Global Confirmation Dialog */}
      <DialogForm
        title={`Delete player "${deletingPlayer?.player_tourneys?.player_name}"?`}
        showSubmit={true}
        isDestructive={true}
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
        onSubmit={onDeletePlayerSubmit}
        onCancel={async () => {
          setDeletingPlayer(null);
          return true;
        }}
        trigger={null}
        formBody={
          <VStack gap={3} py={2}>
            <Text fontSize="sm" textAlign="center" color="fg">
              This will remove <strong>ALL</strong> of {deletingPlayer?.player_tourneys?.player_name}'s scores on <strong>this</strong> specific round!
            </Text>
            <Text fontSize="sm" textAlign="center" color="fg.error" fontWeight="medium">
              Are you sure you want to proceed?
            </Text>
          </VStack>
        }
      />
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