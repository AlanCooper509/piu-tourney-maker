import { Box, VStack, HStack, Link, Text, useBreakpointValue, Button, Spacer, Tag, IconButton, Container, Separator } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";
import { IoReturnDownBack } from "react-icons/io5";

import getSupabaseTable from "../hooks/getSupabaseTable";
import { calculateCombinedRoundRankings } from "../helpers/calculateCombinedRoundRankings";
import { getScoresForPlayer } from "../helpers/getScoresForPlayer";
import { resolveAdvancementDestination } from "../helpers/resolveAdvancementDestination";
import RoundLink from "../components/tourney/RoundLink";
import { deleteScoreFromStages, upsertScoreInStages } from "../helpers/state/stages";
import { deletePlayerFromRound, upsertPlayerInRound } from "../helpers/state/playerRounds";
import { deletePlayerTourney, upsertPlayerTourney } from "../helpers/state/playerTourney";

import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import type { Round } from "../types/Round";
import type { RoundAdvancement } from "../types/RoundAdvancement";
import type { Score } from "../types/Score";
import type { ChartPool } from "../types/ChartPool";
import type { PlayerTourney } from "../types/PlayerTourney";
import { keyframes } from "@emotion/react";

const refinedPulse = keyframes`
  0% { 
    box-shadow: 0 0 0px 0px rgba(63, 63, 70, 1); 
    background-color: rgba(63, 63, 70, 1);
  }
  30% { 
    /* The Silver Effect: White core with a cool-gray outer bloom */
    box-shadow: 
      0 0 12px 3px rgba(255, 255, 255, 0.9), 
      0 0 25px 10px rgba(200, 225, 255, 0.4); 
    background-color: rgba(255, 255, 255, 0.2);
  }
  100% { 
    box-shadow: 0 0 0px 0px rgba(63, 63, 70, 1); 
    background-color: rgba(63, 63, 70, 1);
  }
`;

// --------------------
// Types
// --------------------
interface Song {
  name: string;
  level: number | null;
  type: string | null;
  score: number | null;
  points: number;
}

interface Player {
  name: string;
  songs: Song[];
  total: number; // points total OR cumulative total depending on round
  cumulative: number; // raw cumulative total score
  carryOver?: {
    label: string;
    songs: Song[];
  } | null;
}

// --------------------
// Components
// --------------------
function PlayerRow({
  round,
  player,
  index,
  isExpanded,
  toggleExpand,
  updatedPlayer,
  rowFontSize,
  songFontSize,
  isEliminated
}: {
  round: Round | null;
  player: Player;
  index: number;
  isExpanded: boolean;
  toggleExpand: (name: string) => void;
  updatedPlayer: string | null;
  rowFontSize: string | undefined;
  songFontSize: string | undefined;
  isEliminated: boolean
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  const getBgColor = () => {
    if (isEliminated) return "red.emphasized";
    if ([0,1,2].includes(index)) return undefined;
    return "gray.700";
  };

  const getBgGradient = () => {
    if (isEliminated) return undefined;
    if (index === 0) return "linear-gradient({colors.yellow.300}, {colors.yellow.600})";
    if (index === 1) return "linear-gradient({colors.gray.300}, {colors.gray.700})";
    if (index === 2) return "linear-gradient({colors.yellow.700}, {colors.yellow.900})";
    return undefined;
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isExpanded, player.songs]);

  return (
    <Box mb={2}>
      <HStack
        bg={getBgColor()}
        bgImage={getBgGradient()}
        color={index === 0 ? "white" : "gray.100"}
        px={6}
        py={4}
        cursor="pointer"
        justify="space-between"
        onClick={() => toggleExpand(player.name)}
        _hover={{ transform: "scale(1.02)", shadow: "md" }}
        borderRadius="md"
        textShadow={index === 0 ? "0px 2px 4px rgba(0,0,0,0.5)" : undefined}
        overflow="visible"
        animation={updatedPlayer === player.name ? `${refinedPulse} 2s infinite` : undefined}
        zIndex={updatedPlayer === player.name ? 10 : 1} // Bring to front while pulsing
        position="relative"
        style={{
          transform: "translateZ(0)", // Forces GPU rendering
          willChange: updatedPlayer === player.name ? "box-shadow, transform" : "auto",
        }}
      >
        <HStack flex="1" overflow="hidden">
          <Text fontSize={rowFontSize} fontWeight="bold" flexShrink={0}>
            #{index + 1}
          </Text>
          <Text fontSize={rowFontSize} truncate title={player.name}>
            {player.name}
          </Text>
        </HStack>
        <HStack flexShrink={0} alignItems="center">
          {/* Cumulative Score (only shown when round.points_per_stage is specified) */}
          {round?.points_per_stage && (
            <Text fontSize={"sm"} mr={2}>
              {player.cumulative.toLocaleString()}
            </Text>
          )}

          {/* Total Points (or total score in cumulative mode when round.points_per_stage is null) */}
          <Text fontSize={rowFontSize} fontWeight="medium">
            {player.total.toLocaleString()}
          </Text>
        </HStack>
      </HStack>

      <Box
        ref={contentRef}
        height={height}
        overflow="hidden"
        transition="height 0.3s ease"
        bg="gray.800"
        borderBottom={isExpanded ? "2px solid gray" : "none"}
      >
        <VStack align="stretch" py={3} px={6} gap={player.carryOver ? 4 : 0}>
          <VStack align="stretch" gap={0}>
            {player.carryOver && (
              <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                {round?.name ?? "This Round"}
              </Text>
            )}
            {player.songs.map((song, idx) => (
              <SongRow
                key={`${song.name}-${idx}`}
                song={song}
                isLast={idx === player.songs.length - 1}
                showPoints={!!round?.points_per_stage}
                songFontSize={songFontSize}
              />
            ))}
          </VStack>

          {player.carryOver && (
            <VStack align="stretch" gap={0}>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                {player.carryOver.label}
              </Text>
              {player.carryOver.songs.map((song, idx) => (
                <SongRow
                  key={`${song.name}-${idx}`}
                  song={song}
                  isLast={idx === player.carryOver!.songs.length - 1}
                  showPoints={!!round?.points_per_stage}
                  songFontSize={songFontSize}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

function SongRow({
  song,
  isLast,
  showPoints,
  songFontSize
}: {
  song: Song;
  isLast: boolean;
  showPoints: boolean;
  songFontSize: string | undefined;
}) {
  return (
    <Box borderBottom={isLast ? "none" : "1px solid gray"} py={3}>
      <HStack justify="space-between">
        <Tag.Root colorPalette={song.type?.startsWith("D") ? "green" : song.type?.startsWith("S") ? "red" : song.type?.startsWith("C") ? "yellow" : "blue"}>
          <Tag.Label>{song.level}</Tag.Label>
        </Tag.Root>
        <Text truncate fontSize={songFontSize} textAlign="left">{song.name}</Text>
        <Spacer/>
        {showPoints ? (
          <HStack>
            <Text fontSize={"sm"} mr={2}>{song.score?.toLocaleString()}</Text>
            <Text fontWeight="bold">{song.points}</Text>
          </HStack>
        )
        :
        (
          <Text>{song.score?.toLocaleString()}</Text>
        )}
      </HStack>
    </Box>
  );
}

function LeaderboardHeader({
  round,
  expandedPlayers,
  toggleAll,
  headerFontSize
}: {
  round: Round | null;
  expandedPlayers: Set<string>;
  toggleAll: () => void;
  headerFontSize: string | undefined;
}) {
  return (
    <HStack py={4} px={6} bgGradient="linear(to-r, teal.400, green.400)" borderTopRadius="2xl">
      <Text fontSize={headerFontSize} color="white" textShadow="0px 2px 6px rgba(0,0,0,0.5)">
        {round ? round.points_per_stage ? "Leaderboard (Points)" : "Leaderboard (Cumulative)" : "Leaderboard"}
      </Text>
      <Spacer />
      <Button
        size="md"
        px={6}
        py={4}
        bg="gray.700"
        color="white"
        borderRadius="md"
        _hover={{ bg: "gray.600" }}
        onClick={toggleAll}
      >
        {expandedPlayers.size > 0 ? "Collapse All" : "Expand All"}
      </Button>
    </HStack>
  );
}

// --------------------
// Leaderboard Component
// --------------------
function Leaderboard() {
  const { tourneyId, roundId } = useParams<{ tourneyId: string; roundId: string }>();
  if (!tourneyId || !roundId) return <div>Invalid Tourney or Round ID</div>;
  const activeRoundId = Number(roundId);

  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tourneyPlayers, setTourneyPlayers] = useState<PlayerTourney[]>([]);
  const [updatedPlayer, setUpdatedPlayer] = useState<string | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [p, setP] = useState<PlayerRound[]>([]);
  const [s, setS] = useState<Stage[]>([]);
  const [cp, setCp] = useState<PlayerRound[]>([]);
  const [cs, setCs] = useState<Stage[]>([]);

  const carryOverRoundId = round?.carry_over_round_id ?? null;

  const { data: rounds } = getSupabaseTable<Round>('rounds', { column: 'id', value: roundId });
  const { data: carryOverRounds } = getSupabaseTable<Round>('rounds', { column: 'id', value: carryOverRoundId ?? -1 });
  const { data: roundAdvancements } = getSupabaseTable<RoundAdvancement>('round_advancements', { column: 'round_id', value: roundId });
  const { data: playersData } = getSupabaseTable<PlayerRound>("player_rounds", { column: "round_id", value: roundId }, "*, player_tourneys(player_name, seed)");
  const { data: stagesData, refetch: refetchStages } = getSupabaseTable<Stage>("stages", { column: "round_id", value: roundId }, "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)");
  const { data: tourneyPlayersData } = getSupabaseTable<PlayerTourney>("player_tourneys", { column: "tourney_id", value: tourneyId });
  const { data: carryOverPlayersData } = getSupabaseTable<PlayerRound>("player_rounds", { column: "round_id", value: carryOverRoundId ?? -1 }, "*, player_tourneys(player_name, seed)");
  const { data: carryOverStagesData, refetch: refetchCarryOverStages } = getSupabaseTable<Stage>("stages", { column: "round_id", value: carryOverRoundId ?? -1 }, "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)");

  const carryOverRound = carryOverRoundId ? (carryOverRounds?.find(r => r.id === carryOverRoundId) ?? null) : null;

  // --------------------
  // Sync Supabase data
  // --------------------
  useEffect(() => { if (rounds?.length) setRound(rounds.find(r => r.id === Number(roundId)) ?? null); }, [rounds, roundId]);
  useEffect(() => { if (playersData) setP([...playersData].sort((b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())); }, [playersData]);
  useEffect(() => { if (stagesData) setS([...stagesData].sort((a, b) => a.id - b.id)); }, [stagesData]);
  useEffect(() => { if (tourneyPlayersData) setTourneyPlayers([...tourneyPlayersData]); }, [tourneyPlayersData]);
  useEffect(() => {
    if (!carryOverRoundId) { setCp([]); setCs([]); return; }
    if (carryOverPlayersData) setCp([...carryOverPlayersData].sort((b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, [carryOverPlayersData, carryOverRoundId]);
  useEffect(() => {
    if (!carryOverRoundId) return;
    if (carryOverStagesData) setCs([...carryOverStagesData].sort((a, b) => a.id - b.id));
  }, [carryOverStagesData, carryOverRoundId]);

  // --------------------
  // Real-time subscriptions for highlighting updated players
  // --------------------
  useEffect(() => {
    // ---- SCORES ----
    const scoresChannel = supabaseClient
      .channel('leaderboard-scores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, payload => {
          if (payload.eventType === 'DELETE') {
            setS(prev => deleteScoreFromStages(prev, payload.old.id));
            setCs(prev => deleteScoreFromStages(prev, payload.old.id));
            return;
          }

          const incoming = payload.new as Score;
          const stage = s.find(st => st.id === incoming.stage_id);
          const carryOverStage = cs.find(st => st.id === incoming.stage_id);
          if (!stage && !carryOverStage) return;

          const affectedPlayerRound = [...p, ...cp].find(player => player.id === incoming.player_round_id);
          if (affectedPlayerRound) {
            const name = affectedPlayerRound.player_tourneys.player_name;
            setUpdatedPlayer(name);
            setTimeout(() => setUpdatedPlayer(null), 1500);
          }

          if (stage && stage.round_id === activeRoundId) {
            setS(prev => upsertScoreInStages(prev, incoming));
          }
          if (carryOverStage && carryOverRoundId != null && carryOverStage.round_id === carryOverRoundId) {
            setCs(prev => upsertScoreInStages(prev, incoming));
          }
        }
      )
      .subscribe();

    // ---- PLAYER ROUNDS ----
    const playerRoundsChannel = supabaseClient
      .channel('leaderboard-player-rounds')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_rounds' },
        payload => {
          if (payload.eventType === 'DELETE') {
            setP(prev => deletePlayerFromRound(prev, payload.old.id));
            setCp(prev => deletePlayerFromRound(prev, payload.old.id));
            return;
          }

          const incoming = payload.new as PlayerRound;
          if (incoming.round_id === activeRoundId) {
            setP(prev => upsertPlayerInRound(prev, incoming, tourneyPlayers ?? []));
          } else if (carryOverRoundId != null && incoming.round_id === carryOverRoundId) {
            setCp(prev => upsertPlayerInRound(prev, incoming, tourneyPlayers ?? []));
          }
        }
      )
      .subscribe();

    // ---- STAGES / CHART POOLS ----
    // These are complex joins → refetch instead of incremental
    const stagesChannel = supabaseClient
      .channel('leaderboard-stages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stages' },
        payload => {
          if (payload.eventType === 'DELETE') {
            if (s.find(stage => stage.id === payload.old.id)) refetchStages();
            if (cs.find(stage => stage.id === payload.old.id)) refetchCarryOverStages();
            return;
          }

          const incoming = payload.new as Stage | null;
          if (!incoming) return;
          if (incoming.round_id === activeRoundId) refetchStages();
          if (carryOverRoundId != null && incoming.round_id === carryOverRoundId) refetchCarryOverStages();
        }
      )
      .subscribe();

    const chartPoolsChannel = supabaseClient
      .channel('leaderboard-chart-pools')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chart_pools' },
        payload => {
          const incoming = payload.new as ChartPool | null;
          const stage = s.find(st => st.id === incoming?.stage_id);
          const carryOverStage = cs.find(st => st.id === incoming?.stage_id);
          if (stage && stage.round_id === activeRoundId) refetchStages();
          if (carryOverStage && carryOverRoundId != null && carryOverStage.round_id === carryOverRoundId) refetchCarryOverStages();
        }
      )
      .subscribe();

  const playerTourneyChannel = supabaseClient
    .channel('tourney-players-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'player_tourneys' },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          setTourneyPlayers(prev => deletePlayerTourney(prev, payload.old.id));
          return;
        }

        const incoming = payload.new as PlayerTourney;
        if (incoming.tourney_id !== Number(tourneyId)) return;

        setTourneyPlayers(prev => upsertPlayerTourney(prev, incoming));
      }
    )
    .subscribe();
    return () => {
      supabaseClient.removeChannel(scoresChannel);
      supabaseClient.removeChannel(playerRoundsChannel);
      supabaseClient.removeChannel(stagesChannel);
      supabaseClient.removeChannel(chartPoolsChannel);
      supabaseClient.removeChannel(playerTourneyChannel);
    };
  }, [activeRoundId, carryOverRoundId, s, cs, playersData]);

  // --------------------
  // Build leaderboard
  // --------------------
  useEffect(() => {
    if (!p.length || !s.length || !round) return;

    const carryOverData = (carryOverRound && cp.length && cs.length)
      ? { round: carryOverRound, players: cp, stages: cs }
      : null;

    const combined = calculateCombinedRoundRankings(round, p, s, carryOverData);
    const { rankings, cumulativeScores } = combined;

    // Map back to a structure usable in the leaderboard UI
    const results: Player[] = rankings.map(([playerId, total]) => {
      const playerRound = p.find(pr => pr.id === playerId)!;
      const scores = getScoresForPlayer(playerRound, s); // returns entries with entry.stage.id

      let carryOver: Player["carryOver"] = null;
      const carryOverPlayerRoundId = combined.carryOverPlayerRoundId[playerId];
      if (combined.carryOver && carryOverRound && carryOverPlayerRoundId != null) {
        const carryOverPlayerRound = cp.find(pr => pr.id === carryOverPlayerRoundId);
        if (carryOverPlayerRound) {
          const carryOverScores = getScoresForPlayer(carryOverPlayerRound, cs);
          carryOver = {
            label: carryOverRound.name,
            songs: carryOverScores.map(entry => {
              const stageId = entry.stage.id;
              const points = combined.carryOver!.pointsMap.get(`${carryOverPlayerRoundId}-${stageId}`) ?? 0;
              return {
                name: entry.chart?.name_en ?? "",
                score: entry.score?.score ?? null,
                level: entry.chart?.level ?? 0,
                type: entry.chart?.type ?? "??",
                points
              };
            })
          };
        }
      }

      return {
        name: playerRound.player_tourneys.player_name,
        songs: scores.map(entry => {
          const stageId = entry.stage.id;
          const points = combined.own.pointsMap.get(`${playerRound.id}-${stageId}`) ?? 0;
          return {
            name: entry.chart?.name_en ?? "",
            score: entry.score?.score ?? null,
            level: entry.chart?.level ?? 0,
            type: entry.chart?.type ?? "??",
            points
          };
        }),
        total,
        cumulative: cumulativeScores[playerRound.id],
        carryOver
      };
    });

    setPlayers(results);
  }, [p, s, round, carryOverRound, cp, cs]);

  // --------------------
  // Expand / Collapse
  // --------------------
  const toggleExpand = (playerName: string) => setExpandedPlayers(prev => {
    const newSet = new Set(prev);
    newSet.has(playerName) ? newSet.delete(playerName) : newSet.add(playerName);
    return newSet;
  });
  const toggleAll = () => setExpandedPlayers(prev => prev.size > 0 ? new Set() : new Set(players.map(p => p.name)));

  // --------------------
  // Responsive values
  // --------------------
  const cardWidth = useBreakpointValue({ base: "90%", md: "70%", lg: "50%" });
  const headerFontSize = useBreakpointValue({ base: "xl", md: "2xl", lg: "3xl" });
  const rowFontSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });
  const songFontSize = useBreakpointValue({ base: "sm", md: "md", lg: "lg" });
  const bottomPadding = useBreakpointValue({ base: `${window.innerHeight * 0.15}px`, md: "3rem", lg: "3rem" });

  return (
    <Container maxW="8xl">
      <VStack w="100%" align="center" mt={12} pb={bottomPadding}>
        <Box fontWeight="bold" textShadow="0px 2px 4px rgba(0,0,0,0.4)">
          <HStack>
            <Link href={`/tourney/${tourneyId}/round/${roundId}`}>
              <IconButton variant="outline" colorPalette="cyan" borderWidth="2px" size="sm" px={2}>
                <IoReturnDownBack />
              </IconButton>
            </Link>
            <RoundLink tourneyId={tourneyId} roundId={roundId} roundName={round?.name ?? ""} fontSize="4xl" />
          </HStack>
        </Box>

        <Box w={cardWidth} borderRadius="2xl" shadow="xl" bgGradient="linear(to-b, gray.900, gray.800)">
          <LeaderboardHeader round={round} expandedPlayers={expandedPlayers} toggleAll={toggleAll} headerFontSize={headerFontSize} />

          <AnimatePresence mode="popLayout">
            {players.map((player, index) => {
              const rank = index + 1;
              const destination = resolveAdvancementDestination(rank, roundAdvancements ?? []);
              const isEliminated = destination == null;
              const prevDestination = index > 0
                ? resolveAdvancementDestination(rank - 1, roundAdvancements ?? [])
                : undefined;
              const showSeparator = index > 0 && destination !== prevDestination;
              return (
                <motion.div
                  key={player.name} // Essential for tracking movement
                  layout // This handles the sliding re-order
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                >
                  {showSeparator && (
                    <Separator borderWidth="5px" my={2} borderColor="black" />
                  )}

                  <PlayerRow
                    round={round}
                    player={player}
                    index={index}
                    isExpanded={expandedPlayers.has(player.name)}
                    toggleExpand={toggleExpand}
                    updatedPlayer={updatedPlayer}
                    rowFontSize={rowFontSize}
                    songFontSize={songFontSize}
                    isEliminated={isEliminated}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      </VStack>
    </Container>
  );
}

export default Leaderboard;