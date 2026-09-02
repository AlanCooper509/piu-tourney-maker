import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { PlayerAvatar } from "../PlayerAvatar";
import type { PlayerRound } from "../../types/PlayerRound";

interface StreamUnassignedRosterPoolProps {
  unassignedPlayers: PlayerRound[];
}

export function StreamUnassignedRosterPool({ unassignedPlayers }: StreamUnassignedRosterPoolProps) {
  if (unassignedPlayers.length === 0) return null;

  return (
    <Box
      p={3}
      bg="blackAlpha.400"
      borderRadius="md"
      borderWidth={1}
      borderColor="whiteAlpha.200"
    >
      <Text
        fontSize="xs"
        fontWeight="bold"
        color="orange.400"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={2}
      >
        Unassigned Players ({unassignedPlayers.length})
      </Text>
      <Flex wrap="wrap" gap={2}>
        {unassignedPlayers.map((p) => {
          const playerName = p.player_tourneys?.player_name ?? "TBD";
          return (
            <HStack
              key={p.id}
              bg="blackAlpha.600"
              px={2.5}
              py={1.5}
              borderRadius="md"
              borderWidth={1}
              borderColor="whiteAlpha.300"
            >
              <PlayerAvatar
                src={p.player_tourneys?.player_img}
                alt={playerName}
                size="24px"
                borderRadius="sm"
              />
              <Text fontSize="xs" fontWeight="bold">
                {playerName}
              </Text>
            </HStack>
          );
        })}
      </Flex>
    </Box>
  );
}