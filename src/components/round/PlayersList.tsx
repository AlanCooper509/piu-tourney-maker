import { useMemo, useState } from 'react'
import { Box, Center, createListCollection, Heading, HStack, Text, useFilter, VStack } from '@chakra-ui/react'

import { handleAddPlayerToRound } from '../../handlers/round/handleAddPlayerToRound'
import DeletablePlayerRow from './DeletablePlayerRow'
import AddPlayer from '../players/AddPlayer'
import { toaster } from '../ui/toaster'
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from '../../context/CurrentTourneyContext'
import calculatePlayerRankingsInRound from "../../helpers/calculatePlayerRankingsInRound";
import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';

import type { PlayerRound } from '../../types/PlayerRound'
import type { PlayerTourney } from '../../types/PlayerTourney'
import type { Round } from '../../types/Round'
import type { Stage } from '../../types/Stage'

export interface CalculatedPlayerStats {
  rank: number;
  total: number;       // Points or cumulative score depending on round mode
  cumulative: number;  // Raw cumulative score
  stagePointsMap: Map<number, number>; // stageId -> stagePoints for this player
}

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

  // Calculate live rankings & scores for all players in this round
  const calculatedStatsMap = useMemo(() => {
    const map = new Map<number, CalculatedPlayerStats>();
    if (!players?.length || !stages?.length || !round) return map;

    const { rankings, cumulativeScores, pointsMap } = calculatePlayerRankingsInRound({ players, stages, round });

    rankings.forEach(([playerId, total], idx) => {
      // Extract stage-level points for this player: stageId -> points
      const stagePointsMap = new Map<number, number>();
      stages.forEach((stage) => {
        const key = `${playerId}-${stage.id}`;
        if (pointsMap.has(key)) {
          stagePointsMap.set(stage.id, pointsMap.get(key)!);
        }
      });

      map.set(playerId, {
        rank: idx + 1,
        total,
        cumulative: cumulativeScores[playerId] ?? 0,
        stagePointsMap,
      });
    });

    return map;
  }, [players, stages, round]);

  // Check if ALL players have played ALL stages
  const areAllScoresReported = useMemo(() => {
    if (!players?.length || !stages?.length) return false;

    const totalStages = stages.length;
    return players.every(player => {
      const entries = getScoresForPlayer(player, stages);
      const playedCount = entries.filter(entry => entry.score !== null).length;
      return playedCount === totalStages;
    });
  }, [players, stages]);

  // Sort by leaderboard score if all scores are reported; otherwise sort by default sort_order
  const sortedPlayers = useMemo(() => {
    if (!players) return [];

    return [...players].sort((a, b) => {
      if (areAllScoresReported) {
        const rankA = calculatedStatsMap.get(a.id)?.rank ?? Infinity;
        const rankB = calculatedStatsMap.get(b.id)?.rank ?? Infinity;
        return rankA - rankB; // Low to high (#1 first)
      }

      // Default sorting by sort_order descending
      const aVal = a.sort_order;
      const bVal = b.sort_order;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      return bVal - aVal;
    });
  }, [players, areAllScoresReported, calculatedStatsMap]);

  const collection = usePlayerCollection({ players, tourneyPlayers, searchTerm: newName });

  return (
    <Box w="full" minW={{ base: "100%", sm: "xs" }} maxW="md">
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
      <VStack align={{ base: "center", md: "center", lg: "start" }} justify="center" gap={1}>
        {!loading && !error && sortedPlayers.length ? (
          sortedPlayers.map(p => p ? (
            <DeletablePlayerRow
              key={p.id}
              player={p}
              round={round}
              stages={stages}
              allScoresReported={areAllScoresReported}
              stats={calculatedStatsMap.get(p.id)}
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