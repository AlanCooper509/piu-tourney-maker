import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import { Dialog, IconButton } from "@chakra-ui/react";
import { LuSquareMousePointer } from "react-icons/lu";

import { PickBanDialogContent } from "./PickBanDialogContent";

import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";
import type { Stage } from "../../../types/Stage";

interface StartPickBanDialogProps {
  pickbanRuleset: PickbanRulesetWithSteps;
  chartdrawEntries: ChartdrawEntryWithDetails[];
  setChartdrawEntries: Dispatch<SetStateAction<ChartdrawEntryWithDetails[]>>;
  round: Round;
  players: PlayerRound[];
  stages: Stage[];
}

export default function StartPickBanDialog({
  pickbanRuleset,
  chartdrawEntries,
  round,
  players,
  stages,
  setChartdrawEntries,
}: StartPickBanDialogProps) {
  const [open, setOpen] = useState(false);
  
  const pbStep = useMemo(() => {
    return chartdrawEntries.filter((entry) => entry.action !== null).length;
  }, [chartdrawEntries]);
  
  const isLockedIn = useMemo(() => {
    return stages.some((stage) => stage.round_id === round.id && stage.play_order !== null);
  }, [stages, round.id]);

  const totalSteps = pickbanRuleset?.pickban_ruleset_steps?.length || 0;

  // 1. Determine the color palette based on step progress and lock-in status
  const colorPalette = useMemo(() => {
    if (pbStep === 0) return "green";
    if (pbStep >= totalSteps) {
      return isLockedIn ? "blue" : "green";
    }
    // Fallback mid-draft state gets blue
    return "blue";
  }, [pbStep, totalSteps, isLockedIn]);

  const triggerLabel = useMemo(() => {
    if (pbStep === 0) return "Begin Pick/Ban Flow";
    if (pbStep >= totalSteps) {
      return isLockedIn ? "Show Pick/Ban Flow" : "Finalize Pick/Ban Flow";
    }
    return "Resume Pick/Bans";
  }, [pbStep, totalSteps, isLockedIn]);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="xl" placement="center">
      <Dialog.Trigger asChild>
        <IconButton
          aria-label={triggerLabel}
          variant="surface"
          borderWidth={2}
          size="xl"
          colorPalette={colorPalette}
          px={4}
        >
          {triggerLabel} <LuSquareMousePointer />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Backdrop />
      <Dialog.Positioner>
        <PickBanDialogContent
          round={round}
          players={players}
          pbStep={pbStep}
          isLockedIn={isLockedIn}
          pickbanRuleset={pickbanRuleset}
          chartdrawEntries={chartdrawEntries}
          setChartdrawEntries={setChartdrawEntries}
          setOpen={setOpen}
        />
      </Dialog.Positioner>
    </Dialog.Root>
  );
}