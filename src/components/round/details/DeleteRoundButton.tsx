import { IconButton } from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

import { handleDeleteRound } from "../../../handlers/round/handleDeleteRound";
import { toaster } from "../../ui/toaster";

import type { Round } from "../../../types/Round";

interface DeleteRoundButtonProps {
  round: Round;
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
}

export default function DeleteRoundButton({ round, setRounds }: DeleteRoundButtonProps) {
  const onClick = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${round.name}"? This will remove all associated stages and scores associated with this round. (THIS CANNOT BE UNDONE)`
    );
    if (!confirmDelete) return;

    try {
      await handleDeleteRound(round.id);
      setRounds((prev) => prev.filter((r) => r.id !== round.id));

      toaster.create({
        title: "Round Deleted",
        description: `Successfully removed ${round.name}.`,
        type: "success",
        closable: true,
      });
    } catch (error: any) {
      toaster.create({
        title: "Delete Failed",
        description: error.message || "Ensure the round has no active results before deleting.",
        type: "error",
        closable: true,
      });
    }
  };

  return (
    <IconButton
      aria-label="Delete round"
      variant="outline"
      size="sm"
      colorPalette="red"
      onClick={onClick}
    >
      <FaTrash />
    </IconButton>
  );
}