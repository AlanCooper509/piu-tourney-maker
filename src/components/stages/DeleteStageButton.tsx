import { IconButton, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

import { handleDeleteStage } from "../../handlers/handleDeleteStage";
import { toaster } from "../ui/toaster";
import DialogForm from "../ui/DialogForm";

import type { Round } from "../../types/Round";
import type { Stage } from "../../types/Stage";

interface DeleteStageButtonProps {
  round: Round | null;
  stageId: number;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
}

export default function DeleteStageButton({ round, stageId, setStages }: DeleteStageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDeleteStage() {
    if (!round) return true;
    
    setIsDeleting(true);
    try {
      await handleDeleteStage(stageId);
      setStages((prev: Stage[]) => prev.filter(stage => stage.id !== stageId));
      
      toaster.create({
        title: "Stage deleted",
        description: `Stage ${stageId} was removed from the round.`,
        type: "success",
        closable: true,
      });
      
      setIsOpen(false);
      return true;
    } catch (err: any) {
      toaster.create({
        title: "Failed to delete stage",
        description: err.message,
        type: "error",
        closable: true,
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DialogForm
      title="Delete this stage?"
      showSubmit={true}
      isDestructive={true}
      loading={isDeleting}
      open={isOpen}
      setOpen={setIsOpen}
      onSubmit={onDeleteStage}
      onCancel={async () => true}
      trigger={
        <IconButton
          aria-label="Delete Stage"
          variant="outline"
          borderWidth={2}
          size="sm"
          colorPalette="red"
          px={2}
          mx={1}
        >
          <FaTrash />
        </IconButton>
      }
      formBody={
        <VStack gap={3} py={2}>
          <Text fontSize="sm" textAlign="center" color="fg">
            This will permanently remove its <strong>chart pool</strong>, and any <strong>scores</strong> already played on this stage!!
          </Text>
          <Text fontSize="sm" textAlign="center" color="fg.error" fontWeight="medium">
            Are you sure you want to proceed?
          </Text>
        </VStack>
      }
    />
  );
}