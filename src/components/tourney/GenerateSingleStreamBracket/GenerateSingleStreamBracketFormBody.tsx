import { Box, Field, Heading, HStack, List, NumberInput, Separator, Text, VStack } from "@chakra-ui/react";

import type { PlayerTourney } from "../../../types/PlayerTourney";
import type { SingleStreamTemplateResult } from "../../../handlers/bracketGenerator/generateSingleStreamTemplate";

interface GenerateSingleStreamBracketFormBodyProps {
  players: PlayerTourney[];
  groupSize: number;
  setGroupSize: (value: number) => void;
  directAdvancers: number;
  setDirectAdvancers: (value: number) => void;
  redemptionEnabled: boolean;
  redemptionAdvancers: number;
  setRedemptionAdvancers: (value: number) => void;
  generated: SingleStreamTemplateResult | null;
  generationError: string | null;
}

export default function GenerateSingleStreamBracketFormBody({
  players,
  groupSize,
  setGroupSize,
  directAdvancers,
  setDirectAdvancers,
  redemptionEnabled,
  redemptionAdvancers,
  setRedemptionAdvancers,
  generated,
  generationError,
}: GenerateSingleStreamBracketFormBodyProps) {
  const unseededPlayers = players.filter(p => typeof p.seed !== "number");

  return (
    <VStack align="stretch" gap={4} maxH="700px" overflowY="auto" w="100%" pr={2}>
      {unseededPlayers.length > 0 && (
        <Box p={3} borderWidth={1} borderColor="border.warning" borderRadius="md">
          <Heading size="md" color="orange.600" mb={2}>Warning!</Heading>
          <Text mb={1}>The following players do not have a seed assigned:</Text>
          <List.Root variant="marker" ps={6}>
            {unseededPlayers.map(player => (
              <List.Item key={player.id} color="orange.500">{player.player_name}</List.Item>
            ))}
          </List.Root>
          <Text fontSize="xs" color="gray.400" pt={2} fontStyle="italic">
            They will be seeded last, in the order listed.
          </Text>
        </Box>
      )}

      <Field.Root>
        <Field.Label>Group Size</Field.Label>
        <NumberInput.Root value={String(groupSize)} onValueChange={(e) => setGroupSize(Number(e.value))} min={2}>
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
      </Field.Root>

      <HStack align="start">
        <Field.Root>
          <Field.Label>Direct Advancers</Field.Label>
          <NumberInput.Root value={String(directAdvancers)} onValueChange={(e) => setDirectAdvancers(Number(e.value))} min={1}>
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
        {redemptionEnabled && (
          <Field.Root>
            <Field.Label>Redemption Advancers</Field.Label>
            <NumberInput.Root value={String(redemptionAdvancers)} onValueChange={(e) => setRedemptionAdvancers(Number(e.value))} min={0}>
              <NumberInput.Control />
              <NumberInput.Input />
            </NumberInput.Root>
          </Field.Root>
        )}
      </HStack>

      <Separator />

      {generationError && <Text color="red.400">{generationError}</Text>}

      {generated && (
        <Box borderWidth={1} borderColor="border.emphasized" borderRadius="md" p={3}>
          <Text fontWeight="bold" mb={2}>
            {generated.template.pools.length} round{generated.template.pools.length === 1 ? "" : "s"} will be created:
          </Text>
          <VStack align="start" gap={1}>
            {generated.template.pools.map(pool => (
              <Text key={pool.name} fontSize="sm">
                {pool.name}{pool.matches.length > 1 ? " (+ redemption)" : ""}
              </Text>
            ))}
          </VStack>
        </Box>
      )}

      <Text color="yellow.500">Note: This will delete any pre-existing rounds in this tournament!</Text>
    </VStack>
  );
}
