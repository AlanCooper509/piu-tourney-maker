import { useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { LuUndo2 } from "react-icons/lu"; // Clean undo arrow icon

import { toaster } from "../../ui/toaster";
import { handleUndoPickBanAction } from "../../../handlers/pickban/handleUndoPickBanAction";

import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { Dispatch, SetStateAction } from "react";

interface UndoPickBanButtonProps {
  pbStep: number;
  roundId: number;
  groupId?: number | null; // Added to support optional group scoping
  chartdrawEntries: ChartdrawEntryWithDetails[];
  setChartdrawEntries: Dispatch<SetStateAction<ChartdrawEntryWithDetails[]>>;
  isParentSelecting: boolean;
}

export function UndoPickBanButton({
  pbStep,
  roundId,
  groupId,
  setChartdrawEntries,
  isParentSelecting
}: UndoPickBanButtonProps) {

  if (pbStep === 0) return null;
  const [isUndoing, setIsUndoing] = useState(false);

  const handleUndoLastStep = async () => {
    if (pbStep === 0 || isUndoing || isParentSelecting) return;

    try {
      setIsUndoing(true);

      // 1. Delegate finding and clearing the target entry to the backend safely
      const undoneEntryId = await handleUndoPickBanAction({
        sequence: pbStep,
        roundId,
        groupId,
      });

      // 2. Use the exact entry ID returned by the database to update React state
      setChartdrawEntries((prev) =>
        prev.map((entry) =>
          entry.id === undoneEntryId
            ? { ...entry, action: null, player_round_id: null }
            : entry
        )
      );
    } catch (err: any) {
      console.error("Failed to undo last step:", err);
      toaster.create({
        title: "Undo Failed",
        description: err.message || "Could not connect to server to revert step.",
        type: "error",
      });
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <IconButton
      aria-label="Undo Pick/ban"
      variant="outline"
      colorPalette="red"
      loading={isUndoing}
      disabled={isParentSelecting}
      size="xs"
      px={2}
      onClick={handleUndoLastStep}
    >
      Undo last step <LuUndo2 />
    </IconButton>
  );
}