import { Box, VStack, HStack, Link, Text, useBreakpointValue, Button, Spacer, Tag, IconButton, Heading, Container, Separator } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { keyframes } from "@emotion/react";
import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { useParams } from "react-router-dom";
import { getScoresForPlayer } from "../helpers/getScoresForPlayer";
import type { Round } from "../types/Round";
import RoundLink from "../components/tourney/RoundLink";
import { IoReturnDownBack } from "react-icons/io5";
import React from "react";

interface Song {
  name: string;
  level: number | null;
  type: string | null;
  score: number | null;
}

interface Player {
  name: string;
  songs: Song[];
  total: number;
}

function PlayerRow({
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
    if (index === 0) return undefined;
    if (index === 1) return undefined;
    if (index === 2) return undefined;
    return "gray.700";
  };

  const getBgGradient = () => {
    if (isEliminated) return undefined;
    if (index === 0) return "linear-gradient({colors.yellow.300}, {colors.yellow.600})"; // shiny gold
    if (index === 1) return "linear-gradient({colors.gray.300}, {colors.gray.700})";     // shiny silver
    if (index === 2) return "linear-gradient({colors.yellow.700}, {colors.yellow.900})"; // shiny bronze
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
      key={player.name}
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
      {/* Left side: rank + name */}
      <HStack flex="1" overflow="hidden">
        <Text fontSize={rowFontSize} fontWeight="bold" flexShrink={0}>
          #{index + 1}
        </Text>
        <Text
          fontSize={rowFontSize}
          truncate
          title={player.name}
        >
          {player.name}
        </Text>
      </HStack>

      {/* Right side: total score */}
      <Text fontSize={rowFontSize} flexShrink={0}>
        {player.total.toLocaleString()}
      </Text>
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
              <HStack justify={"space-between"}>
                <Tag.Root colorPalette={song.type?.startsWith("D") ? "green" : song.type?.startsWith("S") ? "red" : song.type?.startsWith("C") ? "yellow" : "blue"}>
                  <Tag.Label>{song.level}</Tag.Label>
                </Tag.Root>
                <Text truncate fontSize={songFontSize} textAlign="left">{song.name}</Text>
                <Spacer/>
                <Text>{song.score?.toLocaleString()}</Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

function Leaderboard() {
  const { tourneyId, roundId } = useParams<{ tourneyId: string; roundId: string }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;
  if (!roundId) return <div>Invalid Round ID</div>;
  const scoring = [1, 0];

  // leaderboard formatted data
  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [updatedPlayer, _setUpdatedPlayer] = useState<string | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  // raw input data
  const [p, setP] = useState<PlayerRound[]>([]);
  const [s, setS] = useState<Stage[]>([]);
  const advancingThreshold = round?.players_advancing ?? null;

  const { data: rounds } = getSupabaseTable<Round>(
    'rounds',
    { column: 'id', value: roundId }
  );
  const { data: playersData } = getSupabaseTable<PlayerRound>(
    "player_rounds",
    { column: "round_id", value: roundId },
    "*, player_tourneys(player_name)"
  );
  const { data: stagesData } = getSupabaseTable<Stage>(
    "stages",
    { column: "round_id", value: roundId },
    "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)"
  );

  // Sync round when roundId changes
  useEffect(() => {
    if (rounds?.length) {
      const found = rounds.find((r) => r.id === Number(roundId));
      setRound(found ?? null);
    }
  }, [rounds, roundId]);

  // Sync players when playersData changes
  useEffect(() => {
    if (playersData) {
      const sortedPlayers = [...playersData].sort(
        (b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setP(sortedPlayers);
    }
  }, [playersData]);

  // Sync stages when stagesData changes
  useEffect(() => {
    if (stagesData) {
      const sortedStages = [...stagesData].sort((a, b) => a.id - b.id);
      setS(sortedStages);
    }
  }, [stagesData]);

  // Build formatted leaderboard players when p or s changes
  useEffect(() => {
    if (!p.length || !round) return;
    const stageScores = p.map(player => {
      const entries = getScoresForPlayer(player, s);
      return {
        name: player.player_tourneys.player_name,
        scores: entries.map(e => ({
          stageId: e.stage.id,
          score: e.score?.score ?? null,
          chart: e.chart ?? null
        }))
      };
    });

    let results;
    if (round.scoring_method === "Points") {
      const pointsMap = new Map(stageScores.map(p => [p.name, 0]));

      s.forEach(stage => {
        const ranked = stageScores
          .map(p => ({
            name: p.name,
            score: p.scores.find(s => s.stageId === stage.id)?.score ?? null
          }))
          .filter((p): p is { name: string; score: number } => p.score !== null)
          .sort((a, b) => b.score - a.score);

        ranked.forEach(r => {
          const firstRankIndex = ranked.findIndex(x => x.score === r.score);
          const awardedPoints = scoring[firstRankIndex] ?? 0;
          pointsMap.set(r.name, (pointsMap.get(r.name) || 0) + awardedPoints);
        });
      });

      results = stageScores.map(p => ({
        name: p.name,
        songs: p.scores.map(s => ({
          name: s.chart?.name_en ?? "",
          score: s.score,
          level: s.chart?.level ?? 0,
          type: s.chart?.type ?? "??",
        })),
        total: pointsMap.get(p.name) ?? 0
      }));
    } else /* if (round?.scoring_method == "Cumulative") */ {
      results = stageScores.map(p => ({
        name: p.name,
        songs: p.scores.map(s => ({
          name: s.chart?.name_en ?? "",
          score: s.score,
          level: s.chart?.level ?? 0,
          type: s.chart?.type ?? "??",
        })),
        total: p.scores.reduce((sum, s) => sum + (s.score ?? 0), 0)
      }));
    }
    results.sort((a, b) => b.total - a.total);
    setPlayers(results);
  }, [p, s]);

  const toggleExpand = (playerName: string) => {
    setExpandedPlayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerName)) {
        newSet.delete(playerName);
      } else {
        newSet.add(playerName);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (expandedPlayers.size > 0) {
      setExpandedPlayers(new Set());
    } else {
      setExpandedPlayers(new Set(players.map((p) => p.name)));
    }
  };

  const highlight = keyframes`
    0% { transform: scale(1); background-color: #e3f4e1; }
    50% { transform: scale(1.03); background-color: #cdeac0; }
    100% { transform: scale(1); background-color: inherit; }
  `;
  void highlight; // to check later, not used anywhere currently

  const positionsRef = useRef<Map<string, number>>(new Map());

  // ------------------------
  // Random score increment effect removed for Supabase integration
  // ------------------------
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prevPlayers) => {
        const newScores = [...prevPlayers];
        const randIndex = Math.floor(Math.random() * newScores.length);
        const randSong = Math.floor(Math.random() * newScores[randIndex].songs.length);

        const increment = Math.floor(Math.random() * 90000) + 10000;
        newScores[randIndex].songs[randSong].score += increment;

        setUpdatedPlayer(newScores[randIndex].name);

        return [...newScores].sort(
          (a, b) =>
            b.songs.reduce((acc, s) => acc + s.score, 0) -
            a.songs.reduce((acc, s) => acc + s.score, 0)
        );
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  */

  const cardWidth = useBreakpointValue({ base: "90%", md: "70%", lg: "50%" });
  const headerFontSize = useBreakpointValue({ base: "xl", md: "2xl", lg: "3xl" });
  const rowFontSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });
  const songFontSize = useBreakpointValue({ base: "sm", md: "md", lg: "lg" });

  // Dynamic bottom padding based on viewport height
  const bottomPadding = useBreakpointValue({
    base: `${window.innerHeight * 0.15}px`, // 15% of viewport height on mobile
    md: "3rem",
    lg: "3rem",
  });

  return (
    <Container maxW="8xl">
      <VStack w="100%" align="center" mt={12} pb={bottomPadding}>
        {/* Round Leaderboard */}
        <Box 
          fontWeight="bold"
          textShadow="0px 2px 4px rgba(0,0,0,0.4)"
        >
          <HStack>
            <Link href={`/tourney/${tourneyId}/round/${roundId}`}>
              <IconButton variant="outline" colorPalette="cyan" borderWidth="2px" size="sm" px={2}>
                <IoReturnDownBack />
              </IconButton>
            </Link>
            <RoundLink
              tourneyId={tourneyId}
              roundId={roundId}
              roundName={round?.name ?? ""}
              fontSize="4xl"
            />
          </HStack>
        </Box>
        <Heading size="2xl" mb={5}>
          Players Advancing: {advancingThreshold}
        </Heading>
        <Box
          w={cardWidth}
          borderRadius="2xl"
          overflow="visible"
          shadow="xl"
          bgGradient="linear(to-b, gray.900, gray.800)"
        >
          <HStack py={4} px={6} bgGradient="linear(to-r, teal.400, green.400)" borderTopRadius="2xl">
            <Text
              fontSize={headerFontSize}
              color="white"
              textShadow="0px 2px 6px rgba(0,0,0,0.5)"
            >
              {round?.scoring_method === "Points" ? "Points Leaderboard" : "Scoreboard"}
            </Text>
            <Spacer />
            <Button
              size="md"
              px={6}
              py={4}                // match row height
              bg="gray.700"
              color="white"
              borderRadius="md"
              _hover={{ bg: "gray.600" }}
              onClick={toggleAll}
            >
              {expandedPlayers.size > 0 ? "Collapse All" : "Expand All"}
            </Button>
          </HStack>

          {players.map((player, index) => {
            const isEliminated = advancingThreshold !== null && index >= advancingThreshold;
            return (
            <React.Fragment key={player.name}>
              {index === advancingThreshold && (
                <Separator borderWidth="5px" my={2} borderColor="black" />
              )}
              <PlayerRow
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
            )
          })}
        </Box>
      </VStack>
    </Container>
  );
}

export default Leaderboard;
