import { useMemo } from "react";
import {
  Grid,
  Center,
  VStack,
  Collapsible,
  Text,
  Box,
  HStack,
  Badge,
  Flex
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";

import { InteractiveChartCard } from "./InteractiveChartCard";
import { comparePlayableOrder, comparePoolOrder, sortChartdrawEntries } from "../../../helpers/sortChartdrawEntries";

import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { UIChartState } from "./PickBanDialogContent";
import type { PickbanRulesetSteps } from "../../../types/Pickban";

interface PickBanGridProps {
  chartdrawEntries: ChartdrawEntryWithDetails[];
  chartStates: Record<number, UIChartState>;
  currentStepRule: PickbanRulesetSteps | undefined;
  activeActorName: string;
  isDone: boolean;
  selectingId: number | null;
  onCardClick: (entryId: number) => Promise<void>;
}

export function PickBanGrid({
  chartdrawEntries,
  chartStates,
  currentStepRule,
  activeActorName,
  isDone,
  selectingId,
  onCardClick,
}: PickBanGridProps) {

  const finalPickedEntries = useMemo(() => {
    return chartdrawEntries
      .filter((entry) => entry.action === "PICK" || entry.action === "AUTOPICK")
      .sort(comparePlayableOrder);
  }, [chartdrawEntries]);

  const finalBannedEntries = useMemo(() => {
    if (!isDone) return [];
    return chartdrawEntries
      .filter((entry) => chartStates[entry.id] === "BAN")
      .sort(comparePoolOrder);
  }, [chartdrawEntries, chartStates, isDone]);

  const sortedDisplayEntries = useMemo(() => {
    return sortChartdrawEntries(chartdrawEntries);
  }, [chartdrawEntries]);

  if (isDone) {
    return (
      <VStack width="100%" gap={6} p={4} align="stretch">
        {/* Picks Display */}
        <Center width="100%">
          <Flex
            wrap="wrap"
            gap={4}
            justify="center"
            align="center"
            width="100%"
          >
            {finalPickedEntries.map((entry) => (
              <Flex
                key={entry.id}
                flexBasis={{
                  base: "calc(50% - 8px)",                                                // 2 columns (adjusting for gap)
                  md: `calc(${100 / Math.min(finalPickedEntries.length, 3)}% - 12px)`,    // max 3 cols
                  "2xl": `calc(${100 / Math.min(finalPickedEntries.length, 5)}% - 13px)`, // max 5 cols
                }}
                // tops items from growing awkwardly beyond their standard column sizes
                maxW={{
                  base: "calc(50% - 8px)",
                  md: `calc(${100 / Math.min(finalPickedEntries.length, 3)}% - 12px)`,
                  "2xl": `calc(${100 / Math.min(finalPickedEntries.length, 5)}% - 13px)`,
                }}
                flexGrow={0}
                flexShrink={0}
              >
                <InteractiveChartCard
                  entry={entry}
                  state={chartStates[entry.id] || "available"}
                  currentStepRule={currentStepRule as PickbanRulesetSteps}
                  resolvedActorName={activeActorName}
                  isDone={isDone}
                  isSelecting={false}
                  onClick={() => { }}
                />
              </Flex>
            ))}
          </Flex>
        </Center>

        {finalBannedEntries.length > 0 && (
          <Collapsible.Root lazyMount unmountOnExit width="100%">
            <Collapsible.Trigger cursor="pointer" width="100%" _hover={{ opacity: 0.8 }}>
              <HStack justify="space-between" width="100%">
                <HStack gap={2} minWidth={0}>
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted" whiteSpace="nowrap">
                    Banned Charts:
                  </Text>
                  <Badge colorPalette="red" variant="subtle" size="md" gap={1}>
                    {finalBannedEntries.length} {finalBannedEntries.length === 1 ? "Ban" : "Bans"}
                  </Badge>
                </HStack>

                <Collapsible.Context>
                  {(context) => (
                    <Box
                      transform={context.open ? "rotate(180deg)" : undefined}
                      transition="transform 0.2s"
                      color="fg.muted"
                      flexShrink={0}
                    >
                      <LuChevronDown size={14} />
                    </Box>
                  )}
                </Collapsible.Context>
              </HStack>
            </Collapsible.Trigger>

            <Collapsible.Content>
              <Box pt={4} pb={4}>
                <Grid
                  templateColumns={{
                    base: "minmax(0, 1fr)",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                    xl: "repeat(4, minmax(0, 1fr))",
                  }}
                  gap={3}
                  width="100%"
                >
                  {finalBannedEntries.map((entry) => (
                    <InteractiveChartCard
                      key={entry.id}
                      entry={entry}
                      state="BAN"
                      currentStepRule={currentStepRule as PickbanRulesetSteps}
                      resolvedActorName={activeActorName}
                      isDone={isDone}
                      isSelecting={false}
                      onClick={() => { }}
                    />
                  ))}
                </Grid>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </VStack>
    );
  }

  return (
    <Grid
      templateColumns={{
        base: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
        xl: "repeat(4, minmax(0, 1fr))",
        "2xl": "repeat(6, minmax(0, 1fr))",
      }}
      gap={3}
      width="100%"
      p={1}
    >
      {sortedDisplayEntries.map((entry) => (
        <InteractiveChartCard
          key={entry.id}
          entry={entry}
          state={chartStates[entry.id] || "available"}
          currentStepRule={currentStepRule as PickbanRulesetSteps}
          resolvedActorName={activeActorName}
          isDone={isDone}
          isSelecting={selectingId === entry.id}
          onClick={() => onCardClick(entry.id)}
        />
      ))}
    </Grid>
  );
}