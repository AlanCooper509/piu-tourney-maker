import React from "react";
import { Box, VStack, HStack, Link, Text, useBreakpointValue, Button, Spacer, Tag, IconButton, Heading, Container, Separator } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";
import { IoReturnDownBack } from "react-icons/io5";

import getSupabaseTable from "../hooks/getSupabaseTable";
import calculatePlayerRankingsInRound from "../helpers/calculatePlayerRankingsInRound";
import { getScoresForPlayer } from "../helpers/getScoresForPlayer";
import RoundLink from "../components/tourney/RoundLink";
import { deleteScoreFromStages, upsertScoreInStages } from "../helpers/state/stages";
import { deletePlayerFromRound, upsertPlayerInRound } from "../helpers/state/playerRounds";
import { deletePlayerTourney, upsertPlayerTourney } from "../helpers/state/playerTourney";

import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import type { Round } from "../types/Round";
import type { Score } from "../types/Score";
import type { ChartPool } from "../types/ChartPool";
import type { PlayerTourney } from "../types/PlayerTourney";

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
  positionsRef,
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
  positionsRef: React.MutableRefObject<Map<string, number>>;
  rowFontSize: string | undefined;
  songFontSize: string | undefined;
  isEliminated: boolean
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
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
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(isExpanded ? `${scrollHeight}px` : "0px");
    }
  }, [isExpanded, player.songs]);

  useEffect(() => {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const prevTop = positionsRef.current.get(player.name) || rect.top;
      const diff = prevTop - rect.top;

      if (diff) {
        rowRef.current.style.transition = "none";
        rowRef.current.style.transform = `translateY(${diff}px)`;

        requestAnimationFrame(() => {
          rowRef.current!.style.transition = "transform 0.5s ease";
          rowRef.current!.style.transform = "translateY(0)";
        });
      }

      positionsRef.current.set(player.name, rect.top);
    }
  }, [player, positionsRef]);

  return (
    <Box
      ref={rowRef}
      animation={updatedPlayer === player.name ? `highlight 0.5s ease` : undefined}
      mb={2}
    >
      <HStack
        bg={getBgColor()}
        bgImage={getBgGradient()}
        color={index === 0 ? "white" : "gray.100"}
        px={6}
        py={4}
        cursor="pointer"
        justify="space-between"
        onClick={() => toggleExpand(player.name)}
        transition="all 0.3s ease"
        _hover={{ transform: "scale(1.02)", shadow: "md" }}
        borderRadius="md"
        textShadow={index === 0 ? "0px 2px 4px rgba(0,0,0,0.5)" : undefined}
        overflow="visible"
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
        transition="height 0.5s ease, opacity 0.5s ease"
        bg="gray.800"
        borderBottom={isExpanded ? "2px solid gray" : "none"}
      >
        <VStack align="stretch" py={3} px={6}>
          {player.songs.map((song, idx) => (
            <Box
              key={song.name}
              borderBottom={idx !== player.songs.length - 1 ? "1px solid gray" : "none"}
              py={3}
            >
              <HStack justify="space-between">
                <Tag.Root colorPalette={song.type?.startsWith("D") ? "green" : song.type?.startsWith("S") ? "red" : song.type?.startsWith("C") ? "yellow" : "blue"}>
                  <Tag.Label>{song.level}</Tag.Label>
                </Tag.Root>
                <Text truncate fontSize={songFontSize} textAlign="left">{song.name}</Text>
                <Spacer/>
                {round?.points_per_stage ? (
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
          ))}
        </VStack>
      </Box>
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
  const [updatedPlayer, _setUpdatedPlayer] = useState<string | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [p, setP] = useState<PlayerRound[]>([]);
  const [s, setS] = useState<Stage[]>([]);
  const advancingThreshold = round?.players_advancing ?? null;

  const positionsRef = useRef<Map<string, number>>(new Map());

  const { data: rounds } = getSupabaseTable<Round>('rounds', { column: 'id', value: roundId });
  const { data: playersData } = getSupabaseTable<PlayerRound>("player_rounds", { column: "round_id", value: roundId }, "*, player_tourneys(player_name)");
  const { data: stagesData, refetch: refetchStages } = getSupabaseTable<Stage>("stages", { column: "round_id", value: roundId }, "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)");
  const { data: tourneyPlayersData } = getSupabaseTable<PlayerTourney>("player_tourneys", { column: "tourney_id", value: tourneyId });

  // --------------------
  // Sync Supabase data
  // --------------------
  useEffect(() => { if (rounds?.length) setRound(rounds.find(r => r.id === Number(roundId)) ?? null); }, [rounds, roundId]);
  useEffect(() => { if (playersData) setP([...playersData].sort((b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())); }, [playersData]);
  useEffect(() => { if (stagesData) setS([...stagesData].sort((a, b) => a.id - b.id)); }, [stagesData]);
  useEffect(() => { if (tourneyPlayersData) setTourneyPlayers([...tourneyPlayersData]); }, [tourneyPlayersData]);

  // --------------------
  // Real-time subscriptions for highlighting updated players
  // --------------------
  useEffect(() => {
    // ---- SCORES ----
    const scoresChannel = supabaseClient
      .channel('leaderboard-scores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        payload => {
          if (payload.eventType === 'DELETE') {
            setS(prev => deleteScoreFromStages(prev, payload.old.id));
            return;
          }

          const incoming = payload.new as Score;
          const stage = s.find(st => st.id === incoming.stage_id);
          if (!stage || stage.round_id !== activeRoundId) return;

          setS(prev => upsertScoreInStages(prev, incoming));
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
            return;
          }

          const incoming = payload.new as PlayerRound;
          if (incoming.round_id !== activeRoundId) return;

          setP(prev =>
            upsertPlayerInRound(prev, incoming, tourneyPlayers ?? [])
          );
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
          if (payload.eventType === 'DELETE' && s.find(stage => stage.id === payload.old.id)) {
            refetchStages();
            return;
          }

          const incoming = payload.new as Stage | null;
          if (!incoming || incoming.round_id !== activeRoundId) return;
          // trigger refetch
          refetchStages();
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
          if (!stage || stage.round_id !== activeRoundId) return;
          refetchStages();
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
  }, [activeRoundId, s, playersData]);

  // --------------------
  // Build leaderboard
  // --------------------
  useEffect(() => {
    if (!p.length || !s.length || !round) return;

  const { rankings, cumulativeScores, pointsMap } = calculatePlayerRankingsInRound({ players: p, stages: s, round });

    // Map back to a structure usable in the leaderboard UI
    const results: Player[] = rankings.map(([playerId, total]) => {
      const playerRound = p.find(pr => pr.id === playerId)!;
      const scores = getScoresForPlayer(playerRound, s); // returns entries with entry.stage.id

      return {
        name: playerRound.player_tourneys.player_name,
        songs: scores.map(entry => {
          const stageId = entry.stage.id;
          const points = pointsMap.get(`${playerRound.id}-${stageId}`) ?? 0;
          return {
            name: entry.chart?.name_en ?? "",
            score: entry.score?.score ?? null,
            level: entry.chart?.level ?? 0,
            type: entry.chart?.type ?? "??",
            points
          };
        }),
        total,
        cumulative: cumulativeScores[playerRound.id]
      };
    });

    setPlayers(results);
  }, [p, s, round]);

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

        <Heading size="2xl" mb={5}>Players Advancing: {advancingThreshold}</Heading>

        <Box w={cardWidth} borderRadius="2xl" overflow="visible" shadow="xl" bgGradient="linear(to-b, gray.900, gray.800)">
          <LeaderboardHeader round={round} expandedPlayers={expandedPlayers} toggleAll={toggleAll} headerFontSize={headerFontSize} />

          {players.map((player, index) => {
            const isEliminated = advancingThreshold !== null && index >= advancingThreshold;
            return (
              <React.Fragment key={player.name}>
                {index === advancingThreshold && <Separator borderWidth="5px" my={2} borderColor="black" />}
                <PlayerRow
                  round={round}
                  player={player}
                  index={index}
                  isExpanded={expandedPlayers.has(player.name)}
                  toggleExpand={toggleExpand}
                  updatedPlayer={updatedPlayer}
                  positionsRef={positionsRef}
                  rowFontSize={rowFontSize}
                  songFontSize={songFontSize}
                  isEliminated={isEliminated}
                />
              </React.Fragment>
            );
          })}
        </Box>
      </VStack>
    </Container>
  );
}

export default Leaderboard;