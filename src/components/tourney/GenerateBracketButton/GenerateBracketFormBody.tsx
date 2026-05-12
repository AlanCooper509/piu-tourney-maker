import { Box, Text, VStack, HStack, List, Heading } from "@chakra-ui/react";

import type { PlayerTourney } from "../../../types/PlayerTourney";

interface SeedPlayersFormBodyProps {
  isDoubleElimination: boolean;
  roundMatches: (PlayerTourney | null)[][];
  playerCount: number;
  players: PlayerTourney[];
}

export default function SeedPlayersFormBody({
  isDoubleElimination,
  roundMatches,
  playerCount,
  players
}: SeedPlayersFormBodyProps) {
  if (!roundMatches) {
    return <Text>No player data available to generate a bracket.</Text>;
  }

  const headerText = <Text fontWeight="bold">
    {isDoubleElimination ?
      `Generate and seed the ${playerCount}-person double elimination bracket?` :
      "Add seeded players into advanced rounds?"
    }
  </Text>
  const paragraphText = isDoubleElimination ?
    "This will also prepare all of the future rounds and advancement paths." :
    "This will add the seeded players to the future rounds of the tournament."
  const footerText = <Text color="yellow.500">Note: This will delete any pre-existing rounds in this tournament!</Text>

  const unseededPlayers = players.filter(p => typeof p.seed !== 'number');
  const warningSection = unseededPlayers.length > 0 ? (
    <Box my={4} p={3} borderWidth={1} borderColor="border.warning" borderRadius="md">
      <Heading size="md" color="orange.600" mb={2}>Warning!</Heading>
      <Text mb={1}>The following players do not have a seed assigned:</Text>
      <VStack align="start" gap={1}>
        <List.Root variant="marker" ps={6}>
          {unseededPlayers.map(player => (
            <List.Item key={player.id} color="orange.500">
              {player.player_name}
            </List.Item>
          ))}
        </List.Root>
      </VStack>
      <Text fontSize="xs" color="gray.400" pt={2} fontStyle="italic">
        They will be assigned seeds automatically starting below the lowest seeded player.
      </Text>
    </Box>
  ) : null;

  return (
    <VStack
      align="start"
      gap={2}
      maxH="700px"
      overflowY="auto"
      w="100%"
      pr={2}
    >
      {warningSection}
      {headerText}

      {isDoubleElimination && (
        <Box w="100%" p={3} mb={2} borderWidth={1} borderColor="border.emphasized" borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            Winners Bracket Preview (Round 1)
          </Text>

          <VStack align="start" gap={2}>
            {roundMatches.map((match, idx) => {
              const [a, b] = match;

              return (
                <HStack key={idx}>
                  <Text w="80px">Match {idx + 1}</Text>

                  <Text>
                    {a?.player_name ?? "[bye]"} vs {b?.player_name ?? "[bye]"}
                  </Text>
                </HStack>
              );
            })}
          </VStack>

          <Box mt={4}>
            <Text fontWeight="bold">Losers Bracket</Text>
            <Text color="gray.400" fontStyle="italic">
              (Will be generated from Winners Bracket outcomes)
            </Text>
          </Box>
        </Box>
      )}

      {paragraphText}
      {footerText}

    </VStack>
  );
}