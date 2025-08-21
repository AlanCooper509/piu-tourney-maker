import { IconButton } from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

import { handleDeleteStage } from "../../handlers/handleDeleteStage";
import { toaster } from "../ui/toaster";

import type { Round } from "../../types/Round";
import type { Stage } from "../../types/Stage";

interface AddStageButtonProps {
  round: Round | null;
  stageId: number;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
}

function alertText() {
  const lines = [
    `WARNING! Really delete this stage?`,
    "This will also permanently remove its chart pool, and any scores already played on this stage!!"
  ]
  return lines.join('\n')
}

export default function DeleteStageButton({ round, stageId, setStages }: AddStageButtonProps) {
  async function onDeleteStage() {
    if (!confirm(alertText())) return;
    if (!round) return;
    try {
      await handleDeleteStage(stageId);
      setStages((prev: Stage[]) => prev.filter(stage => stage.id !== stageId));
      toaster.create({
        title: "Stage deleted",
        description: `Stage ${stageId} was removed from the round.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to delete stage",
        description: err.message,
        type: "error",
        closable: true,
      });
    }
  }

  return (
    <IconButton
      aria-label="Delete Stage"
      variant="outline"
      borderWidth={2}
      size="sm"
      colorPalette="red"
      px={2}
      mx={1}
      onClick={onDeleteStage}
    >
      Remove Stage<FaTrash />
    </IconButton>
  );
}
