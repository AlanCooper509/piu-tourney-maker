import { useEffect, useState } from "react";
import { Box, Field, Heading, NumberInput, Separator, Text, VStack } from "@chakra-ui/react"

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

  const [playersSeededPerRound, setPlayersSeededPerRound] = useState(seededPlayers.length);
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

    for (let r = 0; r < roundsToSeed; r++) {
      const roundPlayers: PlayerTourney[] = [];
      for (let i = 0; i < playersSeededPerRound; i++) {
        const playerIndex = r * playersSeededPerRound + i;
        if (playerIndex >= topPlayersToSeed || playerIndex >= filteredPlayers.length) break;
        roundPlayers.push(filteredPlayers[playerIndex]);
      }
      newPreviewSeeding.push(roundPlayers);
    }

  setPreviewSeeding(prev =>
    JSON.stringify(prev) !== JSON.stringify(newPreviewSeeding)
      ? newPreviewSeeding
      : prev
  );
  }, [topPlayersToSeed, roundsToSeed, playersSeededPerRound]);

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
          max={Math.min(seededPlayers.length, playersSeededPerRound*roundsToSeed)}
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
      <Field.Root>
        <Field.Label fontSize="sm">
          Seeded Players Per Round
        </Field.Label>
        <NumberInput.Root
          size="xs"
          min={0}
          max={seededPlayers.length}
          value={String(playersSeededPerRound)}
          onValueChange={(e) => setPlayersSeededPerRound(Number(e.value))}
          width="200px"
        >
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
      </Field.Root>
      <Box mt={4} p={3} borderWidth={1} borderRadius="md" borderColor="gray.300">
        <Heading size="md" mb={2}>Seeding Preview</Heading>
        {previewSeeding.map((roundPlayers, idx) => (
          <Box key={idx} mb={2}>
            <Text fontWeight="bold">Round {rounds[idx].name}</Text>
            <VStack align="start" gap={0.5} pl={4}>
              {roundPlayers.map(player => (
                <Text key={player.id}>• {player.player_name} (Seed: {player.seed ?? "—"})</Text>
              ))}
            </VStack>
          </Box>
        ))}
      </Box>
      <Box mt={2} fontStyle={"italic"} color="fg.muted">
        (Note: submitting this will completely override any previous seeding of players into rounds)
      </Box>
    </>
  )
}