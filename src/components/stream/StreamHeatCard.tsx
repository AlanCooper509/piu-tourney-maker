import { useMemo } from "react";
import {
  Box,
  Button,
  Center,
  Collapsible,
  Combobox,
  Flex,
  Grid,
  Portal,
  Select,
  Text,
  VStack,
  createListCollection,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import { PlayerAvatar } from "../PlayerAvatar";
import type { PlayerRound } from "../../types/PlayerRound";
import type { Round, StreamState } from "../../types/Round";
import { RiArrowLeftRightLine } from "react-icons/ri";

interface StreamHeatCardProps {
  round: Round;
  heatNum: number;
  heatCapacity: 2 | 4;
  assignedPlayers: PlayerRound[];
  allPlayers: PlayerRound[];
  canDelete: boolean;
  activeStreamState?: StreamState | null;
  setTargetHeatCount: React.Dispatch<React.SetStateAction<number>>;
  onRemoveHeat: (
    heatNumToRemove: number,
    assignedPlayers: PlayerRound[],
    setTargetHeatCount: React.Dispatch<React.SetStateAction<number>>
  ) => void;
  onUpdateHeatLane: (
    playerRoundId: number,
    newHeat: number | null,
    newLane: number | null
  ) => void;
  onPushBroadcast: (
    round: Round,
    heatNum: number,
    lanes: number[],
    reverse_order?: boolean
  ) => void;
}

// Map dropdown string keys to lane arrays
const LANE_PAIR_OPTIONS: Record<string, number[]> = {
  "1,2,3,4": [1, 2, 3, 4],
  "1,2": [1, 2],
  "3,4": [3, 4],
  "1,4": [1, 4],
  "2,3": [2, 3],
  "1,3": [1, 3],
  "2,4": [2, 4],
};

// Collection for Chakra UI Select
const pairCollection = createListCollection({
  items: [
    { label: "All (1-4)", value: "1,2,3,4" },
    { label: "L1 & L2", value: "1,2" },
    { label: "L3 & L4", value: "3,4" },
    { label: "L1 & L4", value: "1,4" },
    { label: "L2 & L3", value: "2,3" },
    { label: "L1 & L3", value: "1,3" },
    { label: "L2 & L4", value: "2,4" },
  ],
});

export function StreamHeatCard({
  round,
  heatNum,
  heatCapacity,
  assignedPlayers,
  allPlayers,
  canDelete,
  activeStreamState,
  setTargetHeatCount,
  onRemoveHeat,
  onUpdateHeatLane,
  onPushBroadcast,
}: StreamHeatCardProps) {
  // Prepare options for player combobox
  const playerOptions = useMemo(() => {
    return [
      { label: "-- Clear Lane --", value: "clear" },
      ...allPlayers.map((p) => ({
        label: p.player_tourneys?.player_name ?? `Player ${p.id}`,
        value: String(p.id),
      })),
    ];
  }, [allPlayers]);

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter, reset: resetInput } = useListCollection({
    initialItems: playerOptions,
    filter: contains,
  });

  // Broadcast status helpers
  const isLiveHeat = activeStreamState?.heat === heatNum;
  const currentActiveLanes = activeStreamState?.lanes ?? [];
  const isFlipped = activeStreamState?.reverse_order ?? false;

  // Determine current active lane key array for Chakra Select ([value])
  const currentPairValue = useMemo(() => {
    if (!isLiveHeat || currentActiveLanes.length === 0) return [];
    const sortedLanes = [...currentActiveLanes].sort((a, b) => a - b).join(",");
    return [sortedLanes];
  }, [isLiveHeat, currentActiveLanes]);

  // Handle Chakra Select change
  const handlePairChange = (details: { value: string[] }) => {
    const selectedValue = details.value[0];
    if (!selectedValue) return;

    const selectedLanes = LANE_PAIR_OPTIONS[selectedValue];
    if (selectedLanes) {
      onPushBroadcast(round, heatNum, selectedLanes, isFlipped);
    }
  };

  // Generate lane indices
  const laneIndices = Array.from({ length: heatCapacity }, (_, i) => i);
  if (isFlipped) {
    laneIndices.reverse();
  }

  return (
    <Collapsible.Root defaultOpen>
      <Box
        bg="blackAlpha.500"
        borderRadius="md"
        borderWidth={1}
        borderColor={isLiveHeat ? "red.500" : "whiteAlpha.300"}
        overflow="hidden"
      >
        {/* Heat Header & Broadcast Controls */}
        <Collapsible.Trigger asChild>
          <Flex
            justify="space-between"
            align="center"
            p={3}
            cursor="pointer"
            userSelect="none"
            wrap="wrap"
            gap={2}
            _hover={{ bg: "whiteAlpha.100" }}
          >
            <Flex align="center" gap={2}>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color={isLiveHeat ? "red.400" : "purple.300"}
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Heat {heatNum}
              </Text>

              {isLiveHeat && (
                <Text
                  fontSize="xs"
                  bg="red.600"
                  color="white"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontWeight="bold"
                >
                  LIVE
                </Text>
              )}
            </Flex>

            {/* Broadcast Controls */}
            <Flex
              align="center"
              gap={2}
              wrap="wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex align="center" gap={1.5}>
                <Text fontSize="xs" opacity={0.7} fontWeight="bold" whiteSpace="nowrap">
                  Broadcast:
                </Text>

                {heatCapacity === 4 ? (
                  <Select.Root
                    collection={pairCollection}
                    size="xs"
                    width="120px"
                    value={currentPairValue}
                    onValueChange={handlePairChange}
                  >
                    <Select.Control>
                      <Select.Trigger
                        bg="gray.800"
                        borderColor={isLiveHeat ? "red.500" : "whiteAlpha.300"}
                      >
                        <Select.ValueText placeholder="Select pair..." />
                      </Select.Trigger>
                    </Select.Control>

                    <Portal>
                      <Select.Positioner>
                        <Select.Content bg="gray.800" borderColor="whiteAlpha.300">
                          {pairCollection.items.map((item) => (
                            <Select.Item
                              key={item.value}
                              item={item}
                              fontSize="xs"
                              cursor="pointer"
                              _hover={{ bg: "whiteAlpha.200" }}
                            >
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                ) : (
                  <Button
                    size="xs"
                    colorPalette={
                      isLiveHeat && currentActiveLanes.length === 2 ? "red" : "blue"
                    }
                    variant={
                      isLiveHeat && currentActiveLanes.length === 2 ? "solid" : "outline"
                    }
                    onClick={() => onPushBroadcast(round, heatNum, [1, 2], isFlipped)}
                  >
                    Pair (L1 & L2)
                  </Button>
                )}
              </Flex>

              {/* Flip Broadcast Order */}
              <Button
                size="xs"
                colorPalette={isFlipped ? "blue" : "gray"}
                variant={isFlipped ? "solid" : "outline"}
                onClick={() =>
                  onPushBroadcast(round, heatNum, currentActiveLanes, !isFlipped)
                }
              >
                <RiArrowLeftRightLine /> {isFlipped ? "Flipped" : "Flip"}
              </Button>

              {canDelete && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="red"
                  fontSize="xs"
                  h="auto"
                  py={1}
                  px={2}
                  ml={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHeat(heatNum, assignedPlayers, setTargetHeatCount);
                  }}
                >
                  Delete Heat
                </Button>
              )}
            </Flex>
          </Flex>
        </Collapsible.Trigger>

        {/* Collapsible Content */}
        <Collapsible.Content>
          <Box p={3} pt={0}>
            <Grid
              templateColumns={{
                base: "1fr",
                sm: `repeat(${heatCapacity}, 1fr)`,
              }}
              gap={3}
            >
              {laneIndices.map((laneIdx) => {
                const laneNum = laneIdx + 1;
                const playerInLane = assignedPlayers.find(
                  (p) => Number(p.heat) === heatNum && Number(p.lane) === laneNum
                );

                const playerName =
                  playerInLane?.player_tourneys?.player_name ?? "TBD";

                const isLaneLive =
                  isLiveHeat && currentActiveLanes.includes(laneNum);

                return (
                  <Box
                    key={laneNum}
                    p={3}
                    bg="blackAlpha.700"
                    borderRadius="md"
                    borderWidth={1}
                    borderColor={
                      isLaneLive
                        ? "red.500"
                        : playerInLane
                          ? "purple.800"
                          : "whiteAlpha.200"
                    }
                    borderStyle={playerInLane ? "solid" : "dashed"}
                    minH="110px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                  >
                    <Flex justify="space-between" align="center">
                      <Text
                        fontSize="xs"
                        opacity={isLaneLive ? 0.9 : 0.5}
                        fontWeight="bold"
                        color={isLaneLive ? "red.400" : "inherit"}
                      >
                        LANE {laneNum}
                      </Text>
                      {isLaneLive && (
                        <Text
                          fontSize="9px"
                          fontWeight="bold"
                          color="red.400"
                          textTransform="uppercase"
                        >
                          BROADCASTING
                        </Text>
                      )}
                    </Flex>

                    {playerInLane ? (
                      <VStack gap={1} align="center" my={1}>
                        <PlayerAvatar
                          src={playerInLane.player_tourneys?.player_img}
                          alt={playerName}
                          size="36px"
                          borderRadius="md"
                        />
                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          color={isLaneLive ? "red.200" : "white"}
                          truncate
                          maxW="110px"
                          title={playerName}
                        >
                          {playerName}
                        </Text>
                      </VStack>
                    ) : (
                      <Center my="auto">
                        <Text fontSize="xs" color="whiteAlpha.400">
                          Empty Lane
                        </Text>
                      </Center>
                    )}

                    <Combobox.Root
                      key={`${laneNum}-${playerInLane?.id ?? "empty"}`}
                      collection={collection}
                      onOpenChange={(details) => {
                        if (details.open) {
                          filter("");
                        }
                      }}
                      onInputValueChange={(e) => filter(e.inputValue)}
                      onValueChange={(details) => {
                        const selectedVal = details.value[0];
                        resetInput();

                        if (!selectedVal || selectedVal === "clear") {
                          if (playerInLane) {
                            onUpdateHeatLane(playerInLane.id, null, null);
                          }
                          return;
                        }

                        onUpdateHeatLane(
                          Number(selectedVal),
                          heatNum,
                          laneNum
                        );
                      }}
                      value={playerInLane ? [String(playerInLane.id)] : []}
                      size="xs"
                      mt={2}
                    >
                      <Combobox.Control>
                        <Combobox.Input
                          placeholder={
                            playerInLane ? playerName : "Assign Player"
                          }
                        />
                        <Combobox.IndicatorGroup>
                          <Combobox.ClearTrigger />
                          <Combobox.Trigger />
                        </Combobox.IndicatorGroup>
                      </Combobox.Control>

                      <Portal>
                        <Combobox.Positioner>
                          <Combobox.Content
                            bg="gray.800"
                            borderColor="whiteAlpha.300"
                          >
                            <Combobox.Empty fontSize="xs">
                              No players found
                            </Combobox.Empty>
                            {collection.items.map((item) => (
                              <Combobox.Item
                                key={item.value}
                                item={item}
                                fontSize="xs"
                                cursor="pointer"
                                _hover={{ bg: "whiteAlpha.200" }}
                              >
                                {item.label}
                                <Combobox.ItemIndicator />
                              </Combobox.Item>
                            ))}
                          </Combobox.Content>
                        </Combobox.Positioner>
                      </Portal>
                    </Combobox.Root>
                  </Box>
                );
              })}
            </Grid>
          </Box>
        </Collapsible.Content>
      </Box>
    </Collapsible.Root>
  );
}