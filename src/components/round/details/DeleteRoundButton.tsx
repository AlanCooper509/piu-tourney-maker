import { IconButton, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

import { handleDeleteRound } from "../../../handlers/round/handleDeleteRound";
import { toaster } from "../../ui/toaster";
import DialogForm from "../../ui/DialogForm";

import type { Round } from "../../../types/Round";

interface DeleteRoundButtonProps {
  round: Round;
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
}

export default function DeleteRoundButton({ round, setRounds }: DeleteRoundButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDeleteRound = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteRound(round.id);
      setRounds((prev) => prev.filter((r) => r.id !== round.id));

      toaster.create({
        title: "Round Deleted",
        description: `Successfully removed ${round.name}.`,
        type: "success",
        closable: true,
      });
      
      setIsOpen(false);
      return true;
    } catch (error: any) {
      toaster.create({
        title: "Delete Failed",
        description: error.message || "Ensure the round has no active results before deleting.",
        type: "error",
        closable: true,
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DialogForm
      title={`Delete "${round.name}"?`}
      showSubmit={true}
      isDestructive={true}
      loading={isDeleting}
      open={isOpen}
      setOpen={setIsOpen}
      onSubmit={onDeleteRound}
      onCancel={async () => true}
      trigger={
        <IconButton
          aria-label="Delete round"
          variant="outline"
          size="sm"
          colorPalette="red"
        >
          <FaTrash />
        </IconButton>
      }
      formBody={
        <VStack gap={3} py={2}>
          <Text fontSize="sm" textAlign="center" color="fg">
            This will permanently remove <strong>all associated stages and scores</strong> tied to this round.
          </Text>
          <Text fontSize="sm" textAlign="center" color="fg.error" fontWeight="heavy">
            THIS CANNOT BE UNDONE. Are you sure you want to proceed?
          </Text>
        </VStack>
      }
    />
  );
}