import { useState } from "react";
import { IconButton, Text, VStack } from "@chakra-ui/react";
import { MdPlaylistRemove } from "react-icons/md";

import DialogForm from "../../ui/DialogForm"; 
import { toaster } from "../../ui/toaster";
import type { Round } from "../../../types/Round";
import { handleResetChartDrawForRound } from "../../../handlers/chartdraw/handleResetChartDrawForRound";

interface ResetChartsDialogProps {
  round: Round | null;
}

export default function ResetChartsDialog({ round }: ResetChartsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirm = async () => {
    if (!round) {
      toaster.create({
        title: "No Round Selected",
        description: "Please select a round to reset its charts.",
        type: "error",
        closable: true,
      });
      return false;
    }
    setIsResetting(true);
    try {
      await handleResetChartDrawForRound(round.id);
      toaster.create({
        title: "Charts Reset",
        description: "Successfully cleared all drawn charts for this round!",
        type: "success",
        closable: true,
      });

      setIsOpen(false);
      return true;
    } catch (error: any) {
      toaster.create({
        title: "Reset Failed",
        description: error.message || "An error occurred while resetting the charts.",
        type: "error",
        closable: true,
      });
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DialogForm
      title="Reset Drawn Charts?"
      showSubmit={true}
      isDestructive={true}
      loading={isResetting}
      open={isOpen}
      setOpen={setIsOpen}
      onSubmit={handleConfirm}
      onCancel={async () => true}
      trigger={
        <IconButton
          aria-label="Reset Charts"
          variant="outline"
          colorPalette="red"
          loading={isResetting}
          borderWidth={2}
          px={2}
          size="xs"
        >
          Reset Chart Draw <MdPlaylistRemove />
        </IconButton>
      }
      formBody={
        <VStack gap={4}>
          <Text fontSize="sm" textAlign="center">
            This will PERMANENTLY remove all currently drawn charts and any picks/bans for this chart draw. It will NOT remove any finalized stages selected or scores if they have been played already.
          </Text>
          <Text fontSize="sm" textAlign="center" mt={2} color="fg.error" fontWeight="bold">
            This action cannot be undone. Are you sure you want to proceed?
          </Text>
        </VStack>
      }
    />
  );
}