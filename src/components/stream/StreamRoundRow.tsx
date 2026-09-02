import { useState } from "react";
import {
  Box,
  Button,
  Collapsible,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";

import { StreamHeatCard } from "./StreamHeatCard";
import { StreamUnassignedRosterPool } from "./StreamUnassignedRosterPool";

import type { Round } from "../../types/Round";
import type { PlayerRound } from "../../types/PlayerRound";
import { handlePushBroadcast } from "../../handlers/heats/handlePushBroadcast";
import { handleRemoveHeat } from "../../handlers/heats/handleRemoveHeat";
import { handleUpdateHeatLane } from "../../handlers/heats/handleUpdateHeatLane";
import { SlCamrecorder } from "react-icons/sl";

interface StreamRoundRowProps {
  round: Round;
  players: PlayerRound[];
  streamRoundId: number | null;
}

export function StreamRoundRow({
  round,
  players,
  streamRoundId,
}: StreamRoundRowProps) {
  const [heatCapacity, setHeatCapacity] = useState<2 | 4>(4);
  const [targetHeatCount, setTargetHeatCount] = useState(1);

  const isFinished = round.status === "Complete";
  const isInProgress = round.status === "In Progress";

  const isActiveStreamRound =
    streamRoundId != null &&
    Number(round.id) === Number(streamRoundId);

  const assignedPlayers = players.filter(
    (p) => p.heat != null && p.lane != null
  );

  const unassignedPlayers = players.filter(
    (p) => p.heat == null || p.lane == null
  );

  const highestDbHeat = Math.max(
    1,
    ...assignedPlayers.map((p) => Number(p.heat ?? 1))
  );

  const totalHeats = Math.max(highestDbHeat, targetHeatCount);
  const heatNumbers = Array.from(
    { length: totalHeats },
    (_, i) => i + 1
  );

  return (
    <Collapsible.Root defaultOpen={isInProgress}>
      <Collapsible.Trigger asChild>
        <Button
          variant="surface"
          colorPalette={
            isActiveStreamRound
              ? "red"
              : isInProgress
                ? "green"
                : isFinished
                  ? "gray"
                  : "blue"
          }
          width="100%"
          justifyContent="space-between"
          px={5}
          py={3}
        >
          <HStack gap={3} minW={0} flex={1} mr={2}>
            <Text
              fontWeight="bold"
              fontSize="lg"
              truncate
              title={round.name}
            >
              {round.name}
            </Text>

            <Text
              fontSize="xs"
              opacity={0.8}
              textTransform="uppercase"
              flexShrink={0}
            >
              ({round.status})
            </Text>

            {isActiveStreamRound && (
              <SlCamrecorder />
            )}
          </HStack>

          <Text fontSize="sm" opacity={0.7} flexShrink={0}>
            {players.length} Player{players.length === 1 ? "" : "s"}
          </Text>
        </Button>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <Box
          bg="blackAlpha.600"
          p={4}
          borderBottomRadius="md"
          borderWidth={1}
          borderColor={
            isActiveStreamRound
              ? "red.800"
              : "whiteAlpha.200"
          }
        >
          {players.length === 0 ? (
            <Text
              fontSize="sm"
              color="whiteAlpha.500"
              textAlign="center"
            >
              No players assigned to this round yet.
            </Text>
          ) : (
            <VStack align="stretch">
              {/* Controls Header */}
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
              >
                <HStack gap={2}>
                  <Text
                    fontSize="xs"
                    opacity={0.7}
                    fontWeight="bold"
                  >
                    Lanes per Heat:
                  </Text>

                  <Button
                    size="xs"
                    variant={
                      heatCapacity === 2 ? "solid" : "outline"
                    }
                    colorPalette="purple"
                    onClick={() => setHeatCapacity(2)}
                  >
                    2 (Head to Head)
                  </Button>

                  <Button
                    size="xs"
                    variant={
                      heatCapacity === 4 ? "solid" : "outline"
                    }
                    colorPalette="purple"
                    onClick={() => setHeatCapacity(4)}
                  >
                    4 (Free For All)
                  </Button>
                </HStack>

                <Button
                  size="xs"
                  colorPalette="green"
                  variant="subtle"
                  onClick={() =>
                    setTargetHeatCount(totalHeats + 1)
                  }
                >
                  <LuPlus />
                  Add Heat
                </Button>
              </Flex>

              {/* Heats View */}
              {heatNumbers.map((heatNum) => (
                <StreamHeatCard
                  round={round}
                  key={heatNum}
                  heatNum={heatNum}
                  heatCapacity={heatCapacity}
                  assignedPlayers={assignedPlayers}
                  allPlayers={players}
                  canDelete={heatNumbers.length > 1}
                  activeStreamState={round.active_stream_state}
                  isActiveStreamRound={isActiveStreamRound}
                  setTargetHeatCount={setTargetHeatCount}
                  onRemoveHeat={handleRemoveHeat}
                  onUpdateHeatLane={handleUpdateHeatLane}
                  onPushBroadcast={handlePushBroadcast}
                />
              ))}

              {/* Unassigned Roster Pool */}
              <StreamUnassignedRosterPool
                unassignedPlayers={unassignedPlayers}
              />
            </VStack>
          )}
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}