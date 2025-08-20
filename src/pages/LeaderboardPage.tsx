import { Box, VStack, HStack, Text, useBreakpointValue, Button, Spacer } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { keyframes } from "@emotion/react";

interface Song {
  name: string;
  score: number;
}

interface Player {
  name: string;
  songs: Song[];
}

function Leaderboard() {
  // State ready for Supabase data
  const [players, setPlayers] = useState<Player[]>([]); // initialPlayers removed
  const [updatedPlayer, setUpdatedPlayer] = useState<string | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

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
  const headerFontSize = useBreakpointValue({ base: "3xl", md: "4xl", lg: "5xl" });
  const rowFontSize = useBreakpointValue({ base: "lg", md: "xl", lg: "2xl" });
  const songFontSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });

  // Dynamic bottom padding based on viewport height
  const bottomPadding = useBreakpointValue({
    base: `${window.innerHeight * 0.15}px`, // 15% of viewport height on mobile
    md: "3rem",
    lg: "3rem",
  });

  return (
    <VStack w="100%" align="center" mt={12} pb={bottomPadding}>
      <Text
        fontSize={{ base: "36px", md: "42px", lg: "48px" }}
        fontWeight="bold"
        textShadow="0px 2px 4px rgba(0,0,0,0.4)"
        mb={6}
      >
        Tourney: {/* TODO */}, Round: {/* TODO */}
      </Text>

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
            Scoreboard
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
          const isTopPlayer = index === 0;
          const isExpanded = expandedPlayers.has(player.name);
          const contentRef = useRef<HTMLDivElement>(null);
          const rowRef = useRef<HTMLDivElement>(null);
          const [height, setHeight] = useState("0px");

          const totalScore = player.songs.reduce((sum, s) => sum + s.score, 0);

          useEffect(() => {
            if (contentRef.current) {
              const scrollHeight = contentRef.current.scrollHeight;
              setHeight(isExpanded ? `${scrollHeight}px` : "0px");
            }
          }, [isExpanded, expandedPlayers]);

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
          }, [players]);

          return (
            <Box
              key={player.name}
              ref={rowRef}
              animation={updatedPlayer === player.name ? `${highlight} 0.5s ease` : undefined}
              mb={2}
            >
              <HStack
                bg={isTopPlayer ? "green.500" : "gray.700"}
                color={isTopPlayer ? "white" : "gray.100"}
                px={6}
                py={4}             // same height as button
                cursor="pointer"
                justify="space-between"
                onClick={() => toggleExpand(player.name)}
                transition="all 0.3s ease"
                _hover={{ transform: "scale(1.02)", shadow: "md" }}
                borderRadius="md"
                textShadow={isTopPlayer ? "0px 2px 4px rgba(0,0,0,0.5)" : undefined}
                overflow="visible"
              >
                <HStack>
                  <Text fontSize={rowFontSize} fontWeight="bold">
                    #{index + 1}
                  </Text>
                  <Text fontSize={rowFontSize}>{player.name}</Text>
                </HStack>
                <Text fontSize={rowFontSize}>{totalScore.toLocaleString()}</Text>
              </HStack>

              <Box
                ref={contentRef}
                height={height}
                overflow="hidden"
                transition="height 0.5s ease, opacity 0.5s ease"
                bg="gray.700"
                borderBottom={isExpanded ? "2px solid gray" : "none"}
              >
                <VStack align="stretch" py={3} px={6}>
                  {player.songs.map((song, idx) => (
                    <Box
                      key={song.name}
                      borderBottom={idx !== player.songs.length - 1 ? "1px solid gray" : "none"}
                      py={3}
                    >
                      <Text
                        fontSize={songFontSize}
                        textAlign="left"
                        textShadow="0px 1px 2px rgba(0,0,0,0.3)"
                      >
                        {song.name}: {song.score.toLocaleString()}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          );
        })}
      </Box>
    </VStack>
  );
}

export default Leaderboard;
