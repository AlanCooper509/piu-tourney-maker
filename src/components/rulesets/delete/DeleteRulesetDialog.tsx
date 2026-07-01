import React, { useState } from "react";
import { IconButton, Text, VStack } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";

import DialogForm from "../../ui/DialogForm"; 
import { toaster } from "../../ui/toaster";
import { handleDeleteChartDrawConfig } from "../../../handlers/chartdraw/handleDeleteChartDrawConfig";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";

interface DeleteRulesetDialogProps {
  chartdrawConfig: ChartdrawConfigWithSpecs;
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function DeleteRulesetDialog({ 
  chartdrawConfig,
  setChartdrawConfigs
}: DeleteRulesetDialogProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteChartDrawConfig(chartdrawConfig.id);
      setChartdrawConfigs((prev) => prev.filter((c) => c.id !== chartdrawConfig.id));

      toaster.create({
        title: "Ruleset Deleted",
        description: `Successfully removed ${chartdrawConfig.name}.`,
        type: "success",
        closable: true,
      });

      setIsDeleteOpen(false);
      return true;
    } catch (error: any) {
      toaster.create({
        title: "Delete Failed",
        description: error.message || "An error occurred while deleting the ruleset.",
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
      title={`Delete ruleset "${chartdrawConfig.name}"?`}
      showSubmit={true}
      isDestructive={true}
      loading={isDeleting}
      open={isDeleteOpen}
      setOpen={setIsDeleteOpen}
      onSubmit={handleConfirm}
      onCancel={async () => true}
      trigger={
        <IconButton
          aria-label="Delete ruleset"
          variant="outline"
          size="sm"
          colorPalette="red"
        >
          <LuTrash2 />
        </IconButton>
      }
      formBody={
        <VStack gap={4}>
          <Text fontSize="sm" textAlign="center">
            This will permanently remove the <strong>{chartdrawConfig.name}</strong> ruleset. 
            Any round pools currently using this ruleset will be unassigned.
          </Text>
          <Text fontSize="sm" textAlign="center" mt={2} color="fg.error">
            Are you sure you want to proceed?
          </Text>
        </VStack>
      }
    />
  );
}