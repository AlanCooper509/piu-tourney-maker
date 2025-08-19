import { IconButton } from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";

import { handleAddStageToRound } from "../../handlers/handleAddStageToRound";

import type { Round } from "../../types/Round";
import type { Stage } from "../../types/Stage";

interface AddStageButtonProps {
  round: Round | null;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
}

export default function AddStageButton({ round, setStages }: AddStageButtonProps) {
  async function onAddStage() {
    if (!round) return;
    const newStage = await handleAddStageToRound(round.id);
    setStages((prev: Stage[]) => [...(prev ?? []), newStage]);
  }

  return (
    <IconButton
      aria-label="Add to Pool"
      size="sm"
      colorPalette="green"
      px={2}
      onClick={onAddStage}
    >
      Add Stage <IoAddCircleSharp />
    </IconButton>
  );
}
