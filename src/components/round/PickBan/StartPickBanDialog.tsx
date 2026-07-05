import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import {
  Button,
  Stack,
  Dialog,
  Text,
  Box,
  Grid,
  IconButton
} from "@chakra-ui/react";
import { LuSwords } from "react-icons/lu";
import { toaster } from "../../ui/toaster";

import { TimelinePips } from "./TimelinePips";
import { ActionHudBanner } from "./ActionHudBanner";
import { InteractiveChartCard } from "./InteractiveChartCard";
import sortPlayersBySeed from "../../../helpers/sortPlayersBySeed";
import { handlePickBanAction } from "../../../handlers/pickban/handlePickBanAction";

import type { PickbanRulesetWithSteps, PickbanAction } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";

export type UIChartState = "available" | PickbanAction;

interface StartPickBanDialogProps {
  pickbanRuleset: PickbanRulesetWithSteps;
  chartdrawEntries: ChartdrawEntryWithDetails[];
  setChartdrawEntries: Dispatch<SetStateAction<ChartdrawEntryWithDetails[]>>;
  round: Round;
  players: PlayerRound[];
}

const STATE_SORT_WEIGHTS: Record<UIChartState, number> = {
  PICK: 1,
  AUTOPICK: 2,
  PROTECT: 3,
  available: 4,
  BAN: 5,
  IGNORE: 6,
};

const getActorPlayerId = (
  actor: string | null,
  players: PlayerRound[]
): number | null => {
  if (!actor || actor === "Automation" || !players || players.length < 2) {
    return null;
  }

  const sorted = sortPlayersBySeed(players);
  if (actor === "Higher Seed") return sorted[0]?.id || null;
  if (actor === "Lower Seed") return sorted[1]?.id || null;

  return null;
};

const resolveActorName = (
  actor: string | null,
  playerLeft: PlayerRound | null,
  playerRight: PlayerRound | null
): string => {
  const activeActor = actor || "Automation";
  
  if (activeActor !== "Higher Seed" && activeActor !== "Lower Seed") {
    return activeActor;
  }

  const p1Name = playerLeft?.player_tourneys?.player_name || "Left Player";
  const p2Name = playerRight?.player_tourneys?.player_name || "Right Player";

  const p1Seed = playerLeft?.player_tourneys?.seed ?? 999;
  const p2Seed = playerRight?.player_tourneys?.seed ?? 999;

  const isP1HigherSeed = p1Seed < p2Seed;

  if (activeActor === "Higher Seed") {
    return isP1HigherSeed ? p1Name : p2Name;
  } else {
    return isP1HigherSeed ? p2Name : p1Name;
  }
};


export default function StartPickBanDialog({
  pickbanRuleset,
  chartdrawEntries,
  round,
  players,
  setChartdrawEntries
}: StartPickBanDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const pbStep = useMemo(() => {
    return chartdrawEntries.filter((entry) => entry.action !== null).length;
  }, [chartdrawEntries]);

  const chartStates = useMemo(() => {
    const states: Record<number, UIChartState> = {};
    chartdrawEntries.forEach((entry) => {
      states[entry.id] = (entry.action as UIChartState) || "available";
    });
    return states;
  }, [chartdrawEntries]);

  const player1 = players[0] || null;
  const player2 = players[1] || null;

  const sequence = pickbanRuleset?.pickban_ruleset_steps || [];
  const currentStepRule = sequence[pbStep];
  const isDone = pbStep >= sequence.length;

  const activeActorName = useMemo(() => {
    return resolveActorName(currentStepRule?.actor, player1, player2);
  }, [currentStepRule, player1, player2]);

  const handleCardClick = async (entryId: number) => {
    if (isDone || !currentStepRule) return;

    const currentState = chartStates[entryId] || "available";
    if (currentState !== "available") return;

    const actionType: PickbanAction = currentStepRule.action;
    const targetedPlayerRoundId = getActorPlayerId(currentStepRule.actor, players);

    try {
      setSelectingId(entryId);
      await handlePickBanAction({
        playerRoundId: targetedPlayerRoundId,
        action: actionType,
        sequence: pbStep + 1,
        chartdrawEntriesId: entryId,
      });

      setChartdrawEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? { ...entry, action: actionType, player_round_id: targetedPlayerRoundId }
            : entry
        )
      );

      const nextStep = pbStep + 1;
      if (nextStep >= sequence.length) {
        toaster.create({
          title: "Pick/Ban Complete",
          description: "All choices have been locked in and saved live to the tournament pool.",
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Failed to execute live pick/ban action via handler:", err);
      toaster.create({
        title: "Database Error",
        description: err.message || "Failed to save action. Please try again.",
        type: "error",
      });
    } finally {
      setSelectingId(null);
    }
  };

  const sortedDisplayEntries = useMemo(() => {
    return [...chartdrawEntries].sort((a, b) => {
      const stateA = chartStates[a.id] || "available";
      const stateB = chartStates[b.id] || "available";
      const diff = STATE_SORT_WEIGHTS[stateA] - STATE_SORT_WEIGHTS[stateB];
      return diff !== 0 ? diff : a.order - b.order;
    });
  }, [chartdrawEntries, chartStates]);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="xl" placement="center">
      <Dialog.Trigger asChild>
        <IconButton
          aria-label="Begin Pick/Ban Flow"
          variant="outline"
          borderWidth={2}
          size="xl"
          colorPalette="green"
          onClick={() => setOpen(true)}
          px={4}
        >
          {pbStep > 0 ? "Resume Pick/Ban Flow" : "Begin Pick/Ban Flow"} <LuSwords />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="bg.panel" maxW={{ base: "95vw", md: "85vw", xl: "1200px" }} minW={{ md: "80vw" }}>
          <Dialog.Header>
            <Dialog.Title>Pick/Ban for {round.name}</Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger />

          <Dialog.Body>
            <Stack gap={4}>
              <TimelinePips sequence={sequence} pbStep={pbStep} />

              {!isDone && currentStepRule ? (
                <ActionHudBanner
                  currentStepRule={currentStepRule}
                  pbStep={pbStep}
                  totalSteps={sequence.length}
                  playerLeft={player1}
                  playerRight={player2}
                  resolvedName={activeActorName}
                />
              ) : (
                <Box p={4} bg="green.alpha.10" borderRadius="md" borderWidth="2px" borderColor="green.600" textAlign="center">
                  <Text fontSize="lg" fontWeight="black" color="green.500">PICK/BAN COMPLETE</Text>
                  <Text fontSize="xs" color="fg.muted" mt={1}>All mutations resolved cleanly.</Text>
                </Box>
              )}

              <Grid
                templateColumns={{
                  base: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  xl: "repeat(4, minmax(0, 1fr))",
                  "2xl": "repeat(5, minmax(0, 1fr))"
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
                    currentStepRule={currentStepRule}
                    resolvedActorName={activeActorName}
                    isDone={isDone}
                    isSelecting={selectingId === entry.id}
                    onClick={() => handleCardClick(entry.id)}
                  />
                ))}
              </Grid>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Minimize Window
            </Button>
            {isDone && (
              <Button colorPalette="green" onClick={() => setOpen(false)}>
                Commit Match to Tournament
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}