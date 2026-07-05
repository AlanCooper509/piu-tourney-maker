import { useMemo } from "react";
import { Grid, Center } from "@chakra-ui/react";
import { InteractiveChartCard } from "./InteractiveChartCard";
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

const STATE_SORT_WEIGHTS: Record<UIChartState, number> = {
  PICK: 1, AUTOPICK: 2, PROTECT: 3, available: 4, BAN: 5, IGNORE: 6,
};

export function PickBanGrid({
  chartdrawEntries,
  chartStates,
  currentStepRule,
  activeActorName,
  isDone,
  selectingId,
  onCardClick,
}: PickBanGridProps) {

  // 1. Sort Strategy for the Active Play Lineup (group -> play_order)
  const comparePlayableOrder = (a: ChartdrawEntryWithDetails, b: ChartdrawEntryWithDetails) => {
    if (a.group !== b.group) {
      if (a.group === null || a.group === undefined) return -1;
      if (b.group === null || b.group === undefined) return 1;
      return a.group - b.group;
    }
    // Fallback safely to 0 if play_order hasn't populated yet
    return (a.play_order ?? 0) - (b.play_order ?? 0);
  };

  // 2. Sort Strategy for the Card Pool (group -> draw_order)
  const comparePoolOrder = (a: ChartdrawEntryWithDetails, b: ChartdrawEntryWithDetails) => {
    if (a.group !== b.group) {
      if (a.group === null || a.group === undefined) return -1;
      if (b.group === null || b.group === undefined) return 1;
      return a.group - b.group;
    }
    return a.draw_order - b.draw_order;
  };

  // Process sorted final entries showcase (Only showing the lineup chronological sequence)
  const finalPickedEntries = useMemo(() => {
    return chartdrawEntries
      .filter((entry) => entry.action === "PICK" || entry.action === "AUTOPICK")
      .sort(comparePlayableOrder);
  }, [chartdrawEntries]);

  // Process active phase drafting view
  const sortedDisplayEntries = useMemo(() => {
    return [...chartdrawEntries].sort((a, b) => {
      const stateA = chartStates[a.id] || "available";
      const stateB = chartStates[b.id] || "available";

      const isPickedA = stateA === "PICK" || stateA === "AUTOPICK";
      const isPickedB = stateB === "PICK" || stateB === "AUTOPICK";

      // If BOTH are drafted maps, sort them in chronological gameplay timeline order
      if (isPickedA && isPickedB) {
        return comparePlayableOrder(a, b);
      }

      // Otherwise, group structural cards by status bucket weight
      const diff = STATE_SORT_WEIGHTS[stateA] - STATE_SORT_WEIGHTS[stateB];
      if (diff !== 0) return diff;

      // Tie-breaker within the same bucket (e.g. remaining available pool cards, bans)
      return comparePoolOrder(a, b);
    });
  }, [chartdrawEntries, chartStates]);

  if (isDone) {
    return (
      <Center width="100%" p={4}>
        <Grid
          templateColumns={{
            base: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            md: `repeat(${Math.min(finalPickedEntries.length, 3)}, minmax(0, 1fr))`,
            lg: `repeat(${Math.min(finalPickedEntries.length, 4)}, minmax(0, 1fr))`,
          }}
          gap={4}
          justifyContent="center"
          alignItems="center"
        >
          {finalPickedEntries.map((entry) => (
            <InteractiveChartCard
              key={entry.id}
              entry={entry}
              state={chartStates[entry.id] || "available"}
              currentStepRule={currentStepRule as PickbanRulesetSteps}
              resolvedActorName={activeActorName}
              isDone={isDone}
              isSelecting={false}
              onClick={() => {}} 
            />
          ))}
        </Grid>
      </Center>
    );
  }

  return (
    <Grid
      templateColumns={{
        base: "minmax(0, 1fr)",
        sm: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
        xl: "repeat(4, minmax(0, 1fr))",
        "2xl": "repeat(5, minmax(0, 1fr))",
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