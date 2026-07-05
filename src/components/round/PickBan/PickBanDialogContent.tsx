import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import { Stack, Dialog, IconButton } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

import { toaster } from "../../ui/toaster";
import { TimelinePips } from "./TimelinePips";
import { ActionHudBanner } from "./ActionHudBanner";
import { UndoPickBanButton } from "./UndoPickBanButton";
import { PickBanGrid } from "./PickBanGrid";
import { handleExecutePickBanFlow } from "../../../handlers/pickban/handleExecutePickBanFlow";
import { handleCreateStages } from "../../../handlers/pickban/handleCreateStages";

import type { PickbanRulesetWithSteps, PickbanAction, PickbanActor } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";
import type { Stage } from "../../../types/Stage";

export type UIChartState = "available" | PickbanAction;

interface PickBanDialogContentProps {
  round: Round;
  players: PlayerRound[];
  stages: Stage[];
  pbStep: number;
  pickbanRuleset: PickbanRulesetWithSteps;
  chartdrawEntries: ChartdrawEntryWithDetails[];
  setChartdrawEntries: Dispatch<SetStateAction<ChartdrawEntryWithDetails[]>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const resolveActorName = (
  actor: PickbanActor,
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
  stages,
  pbStep,
  pickbanRuleset,
  chartdrawEntries,
  setChartdrawEntries,
  setOpen
}: PickBanDialogContentProps) {
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [isLockingIn, setIsLockingIn] = useState<boolean>(false);
  const isLockedIn = useMemo(() => {
    return stages.some((stage) => stage.round_id === round.id && stage.play_order !== null);
  }, [stages, round.id]);

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

      setChartdrawEntries((prev) =>
        prev.map((entry) =>
          updatedEntriesMap[entry.id]
            ? {
              ...entry,
              action: updatedEntriesMap[entry.id].action,
              player_round_id: updatedEntriesMap[entry.id].player_round_id,
              play_order: updatedEntriesMap[entry.id].play_order
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

  const onLockInSelection = async () => {
    if (isLockingIn) return;
    let shouldClose = false;

    try {
      setIsLockingIn(true);
      await handleCreateStages(round.id, chartdrawEntries);

      toaster.create({
        title: "Stages Locked In",
        description: "The final stages have been added onto the round.",
        type: "success",
      });

      shouldClose = true;
    } catch (err: any) {
      console.error("Failed to finalize pick/bans:", err);
      toaster.create({
        title: "Lock In Failed",
        description: err.message || "Could not save stages onto the round.",
        type: "error",
      });
    } finally {
      setIsLockingIn(false);
      if (shouldClose && typeof setOpen === "function") {
        setOpen(false);
      }
    }
  };

  return (
    <Dialog.Content bg="bg.panel" maxW={{ base: "95vw", md: "85vw", xl: "1200px" }} minW={{ md: "80vw" }}>
      <Dialog.Header>
        <Dialog.Title>Pick/Ban for {round.name}</Dialog.Title>
      </Dialog.Header>
      <Dialog.CloseTrigger asChild>
        <IconButton aria-label="Close Dialog" variant="ghost" size="sm" colorPalette="gray" disabled={isLockingIn}>
          <LuX />
        </IconButton>
      </Dialog.CloseTrigger>

      <Dialog.Body>
        <Stack gap={4}>
          <TimelinePips sequence={sequence} pbStep={pbStep} />

          <ActionHudBanner
            currentStepRule={currentStepRule}
            pbStep={pbStep}
            totalSteps={sequence.length}
            playerLeft={player1}
            playerRight={player2}
            resolvedName={activeActorName}
            isDone={isDone}
            isLockedIn={isLockedIn}
            onLockIn={onLockInSelection}
          />

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
        {pbStep > 0 && !isLockedIn && (
          <UndoPickBanButton
            pbStep={pbStep}
            roundId={round.id}
            groupId={chartdrawEntries[0]?.group}
            isParentSelecting={selectingId !== null || isLockingIn}
            chartdrawEntries={chartdrawEntries}
            setChartdrawEntries={setChartdrawEntries}
          />
        )}
      </Dialog.Footer>
    </Dialog.Content>
  );
}