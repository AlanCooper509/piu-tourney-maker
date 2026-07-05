import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import { Stack, Dialog, Text, Box, IconButton } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

import { toaster } from "../../ui/toaster";
import { TimelinePips } from "./TimelinePips";
import { ActionHudBanner } from "./ActionHudBanner";
import { UndoPickBanButton } from "./UndoPickBanButton";
import { PickBanGrid } from "./PickBanGrid";
import { handleExecutePickBanFlow } from "../../../handlers/pickban/handleExecutePickBanFlow";

import type { PickbanRulesetWithSteps, PickbanAction } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";

export type UIChartState = "available" | PickbanAction;

interface PickBanDialogContentProps {
  round: Round;
  players: PlayerRound[];
  pbStep: number;
  pickbanRuleset: PickbanRulesetWithSteps;
  chartdrawEntries: ChartdrawEntryWithDetails[];
  setChartdrawEntries: Dispatch<SetStateAction<ChartdrawEntryWithDetails[]>>;
}

const resolveActorName = (
  actor: string | null,
  playerLeft: PlayerRound | null,
  playerRight: PlayerRound | null
): string => {
  const activeActor = actor || "Automation";
  if (activeActor !== "Higher Seed" && activeActor !== "Lower Seed") return activeActor;

  const p1Name = playerLeft?.player_tourneys?.player_name || "Left Player";
  const p2Name = playerRight?.player_tourneys?.player_name || "Right Player";
  const p1Seed = playerLeft?.player_tourneys?.seed ?? 999;
  const p2Seed = playerRight?.player_tourneys?.seed ?? 999;

  return p1Seed < p2Seed
    ? (activeActor === "Higher Seed" ? p1Name : p2Name)
    : (activeActor === "Higher Seed" ? p2Name : p1Name);
};

export function PickBanDialogContent({
  round,
  players,
  pbStep,
  pickbanRuleset,
  chartdrawEntries,
  setChartdrawEntries
}: PickBanDialogContentProps) {
  const [selectingId, setSelectingId] = useState<number | null>(null);

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

  const onCardClick = async (entryId: number) => {
    if (isDone || !currentStepRule || (chartStates[entryId] || "available") !== "available") return;

    try {
      setSelectingId(entryId);

      const updatedEntriesMap = await handleExecutePickBanFlow({
        initialEntryId: entryId,
        pickbanRuleset,
        chartdrawEntries,
        players,
        currentStepIndex: pbStep,
      });

      // Streamlined State Updater 
      setChartdrawEntries((prev) =>
        prev.map((entry) => 
          updatedEntriesMap[entry.id] 
            ? { 
                ...entry, 
                action: updatedEntriesMap[entry.id].action,
                player_round_id: updatedEntriesMap[entry.id].player_round_id,
                play_order: updatedEntriesMap[entry.id].play_order // Map to local state
              } 
            : entry
        )
      );

      const changesCount = Object.keys(updatedEntriesMap).length;
      if (pbStep + changesCount >= sequence.length) {
        toaster.create({
          title: "Pick/Ban Complete",
          description: "All steps have completed successfully.",
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Failed to execute pick/ban flow step updates:", err);
      toaster.create({
        title: "Database Error",
        description: err.message || "Failed to process choices.",
        type: "error",
      });
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <Dialog.Content bg="bg.panel" maxW={{ base: "95vw", md: "85vw", xl: "1200px" }} minW={{ md: "80vw" }}>
      <Dialog.Header>
        <Dialog.Title>Pick/Ban for {round.name}</Dialog.Title>
      </Dialog.Header>
      <Dialog.CloseTrigger>
        <IconButton aria-label="Close Dialog" variant="ghost" size="sm" colorPalette="gray">
          <LuX />
        </IconButton>
      </Dialog.CloseTrigger>

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
              <Text fontSize="lg" fontWeight="black" color="green.500">LOCK IN THE PICK/BANS</Text>
              <Text fontSize="xs" color="fg.muted" mt={1}>Pick/Ban steps have been completed.</Text>
            </Box>
          )}

          <PickBanGrid
            chartdrawEntries={chartdrawEntries}
            chartStates={chartStates}
            currentStepRule={currentStepRule}
            activeActorName={activeActorName}
            isDone={isDone}
            selectingId={selectingId}
            onCardClick={onCardClick}
          />
        </Stack>
      </Dialog.Body>

      <Dialog.Footer>
        {pbStep > 0 && (
          <UndoPickBanButton
            pbStep={pbStep}
            roundId={round.id}
            groupId={chartdrawEntries[0]?.group}
            isParentSelecting={selectingId !== null}
            chartdrawEntries={chartdrawEntries}
            setChartdrawEntries={setChartdrawEntries}
          />
        )}
      </Dialog.Footer>
    </Dialog.Content>
  );
}