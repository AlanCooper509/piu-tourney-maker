import { useEffect, useState } from "react";
import { Box, Field, Heading, HStack, NumberInput, Separator, Text, VStack } from "@chakra-ui/react"
import { FaSeedling } from "react-icons/fa";
import { TbUserQuestion } from "react-icons/tb";

import type { PlayerTourney } from "../../../types/PlayerTourney"
import type { Round } from "../../../types/Round"

interface SeedPlayersFormBody {
  players: PlayerTourney[] | null
  rounds: Round[]
  previewSeeding: PlayerTourney[][]
  setPreviewSeeding: React.Dispatch<React.SetStateAction<PlayerTourney[][]>>
}
export default function SeedPlayersFormBody({players, rounds, previewSeeding, setPreviewSeeding}: SeedPlayersFormBody) {
  let seededPlayers: PlayerTourney[] = [];
  let unseededPlayers: PlayerTourney[] = [];
  if (players) {
    seededPlayers = players
      .filter(p => p.seed !== null && p.seed !== undefined)
      .sort((a, b) => (a.seed! - b.seed!)); // sort only the seeded players
    unseededPlayers = players.filter(p => p.seed === null || p.seed === undefined);
  }

  const [playersSeededPerRound, setPlayersSeededPerRound] = useState(0);
  const [playersPerRound, setPlayersPerRound] = useState(seededPlayers.length);
  const [topPlayersToSeed, setTopPlayersToSeed] = useState(seededPlayers.length);
  const [roundsToSeed, setRoundsToSeed] = useState(rounds.length);


  useEffect(() => {
    if (!players || !rounds) return;

    const seededPlayers = players
      .filter(p => p.seed != null)
      .sort((a, b) => a.seed! - b.seed!);

    const filteredPlayers = seededPlayers
      .slice(0, topPlayersToSeed)
      .sort((a, b) => b.seed! - a.seed!);

    const newPreviewSeeding: PlayerTourney[][] = [];

    let playerIndex = 0;
    for (let r = 0; r < roundsToSeed; r++) {
      const roundPlayers: PlayerTourney[] = [];

      // use playersPerRound for first round, else playersSeededPerRound
      const playersThisRound = r === 0 ? playersPerRound : playersSeededPerRound;

      for (let i = 0; i < playersThisRound; i++) {
        if (playerIndex >= topPlayersToSeed || playerIndex >= filteredPlayers.length) break;
        roundPlayers.push(filteredPlayers[playerIndex]);
        playerIndex++; // advance global index across all rounds
      }

      newPreviewSeeding.push(roundPlayers);
    }

    // only update state if changed (avoids infinite re-render)
    setPreviewSeeding(prev =>
      JSON.stringify(prev) !== JSON.stringify(newPreviewSeeding)
        ? newPreviewSeeding
        : prev
    );
  }, [topPlayersToSeed, roundsToSeed, playersSeededPerRound, playersPerRound]);

  if (rounds.length === 0) {
    return (
      <Box my={4} p={3} borderWidth={1} borderColor="red.500" borderRadius="md">
        <Heading size="md" color="red.600" mb={2}>Error</Heading>
        <Text>There are no Rounds to seed players into yet! Add some rounds first.</Text>
      </Box>
    );
  }

  return (
    <>
      {unseededPlayers.length > 0 && (
        <Box my={4} p={3} borderWidth={1} borderColor="orange.500" borderRadius="md">
          <Heading size="md" color="orange.600" mb={2}>Warning!</Heading>
          <Text mb={1}>The following players do not have a seed assigned:</Text>
          <VStack align="start" gap={1}>
            {unseededPlayers.map(player => (
              <Text key={player.id} color="orange.500">
                {player.player_name}
              </Text>
            ))}
          </VStack>
        </Box>
      )}
      <Box mt={4} mb={2} fontWeight="bold">
        Seed the top
        <NumberInput.Root
          display="inline-flex"
          size="xs"
          min={0}
          max={Math.min(seededPlayers.length, playersSeededPerRound*(roundsToSeed - 1) + playersPerRound)}
          value={String(topPlayersToSeed)}
          onValueChange={(e) => setTopPlayersToSeed(Number(e.value))}
          width="50px"
          mx={1}
        >
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
        players into the first
        <NumberInput.Root
          display="inline-flex"
          size="xs"
          min={1}
          max={rounds.length}
          value={String(roundsToSeed)}
          onValueChange={(e) => setRoundsToSeed(Number(e.value))}
          width="50px"
          mx={1}
        >
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
        rounds?
      </Box>
      <Separator my={4}></Separator>
      <HStack>
        <Field.Root>
          <Field.Label fontSize="sm">
            Total Players Per Round
          </Field.Label>
          <NumberInput.Root
            size="xs"
            min={playersSeededPerRound}
            max={seededPlayers.length}
            value={String(playersPerRound)}
            onValueChange={(e) => setPlayersPerRound(Number(e.value))}
            width="200px"
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="sm">
            Seeded Players Per Round
          </Field.Label>
          <NumberInput.Root
            size="xs"
            min={0}
            max={playersPerRound}
            value={String(playersSeededPerRound)}
            onValueChange={(e) => setPlayersSeededPerRound(Number(e.value))}
            width="200px"
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
      </HStack>
      <Box mt={4} p={3} borderWidth={1} borderRadius="md" borderColor="gray.300">
        <Heading size="md" mb={2}>Seeding Preview</Heading>
        {previewSeeding.map((roundPlayers, idx) => {
          const round = rounds[idx];
          const playersThisRound = idx === 0 ? playersPerRound : playersSeededPerRound;
          const emptySlots = Math.max(playersPerRound - playersThisRound, 0);

          return (
            <Box key={idx} mb={2}>
              <Text fontWeight="bold">
                {round.name}
              </Text>
              <VStack align="start" gap={0.5} pl={4}>
                {/* Render seeded players */}
                {roundPlayers.map(player => (
                  <HStack key={player.id} gap={2} align="center">
                    <FaSeedling />
                    <Text key={player.id}> {player.player_name} (Seed: {player.seed ?? "—"})</Text>
                  </HStack>
                ))}

                {/* Render empty slots */}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <HStack key={`empty-${idx}-${i}`} gap={2} align="center">
                    <TbUserQuestion />
                    <Text color="gray.400">
                      _____________
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          );
        })}
      </Box>
      <Box mt={2} fontStyle={"italic"} color="fg.muted">
        (Note: submitting this will completely override any previous seeding of players into rounds)
      </Box>
    </>
  )
}