import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import { Dialog, IconButton } from "@chakra-ui/react";
import { LuSwords } from "react-icons/lu";

import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";

import { PickBanDialogContent } from "./PickBanDialogContent";

interface StartPickBanDialogProps {
  pickbanRuleset: PickbanRulesetWithSteps;
  chartdrawEntries: ChartdrawEntryWithDetails[];
  setChartdrawEntries: Dispatch<SetStateAction<ChartdrawEntryWithDetails[]>>;
  round: Round;
  players: PlayerRound[];
}

export default function StartPickBanDialog({
  pickbanRuleset,
  chartdrawEntries,
  round,
  players,
  setChartdrawEntries,
}: StartPickBanDialogProps) {
  const [open, setOpen] = useState(false);

  const pbStep = useMemo(() => {
    return chartdrawEntries.filter((entry) => entry.action !== null).length;
  }, [chartdrawEntries]);

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
        {open && (
          <PickBanDialogContent
            round={round}
            players={players}
            pbStep={pbStep}
            pickbanRuleset={pickbanRuleset}
            chartdrawEntries={chartdrawEntries}
            setChartdrawEntries={setChartdrawEntries}
          />
        )}
      </Dialog.Positioner>
    </Dialog.Root>
  );
}