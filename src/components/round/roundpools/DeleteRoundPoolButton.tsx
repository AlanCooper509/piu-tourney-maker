import { IconButton, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

import { handleDeleteRoundPool } from "../../../handlers/roundpool/handleDeleteRoundPool";
import { toaster } from "../../ui/toaster";
import DialogForm from "../../ui/DialogForm";

import type { RoundPool } from "../../../types/RoundPool";

interface DeleteRoundPoolButtonProps {
  pool: RoundPool;
  roundCount: number;
  setRoundPools: React.Dispatch<React.SetStateAction<RoundPool[]>>;
}

export default function DeleteRoundPoolButton({ pool, roundCount, setRoundPools }: DeleteRoundPoolButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDeletePool = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteRoundPool(pool.id);
      setRoundPools((prev) => prev.filter((p) => p.id !== pool.id));

      toaster.create({
        title: "Pool Deleted",
        description: `Successfully removed ${pool.name}.`,
        type: "success",
        closable: true,
      });

      setIsOpen(false);
      return true;
    } catch (error: any) {
      toaster.create({
        title: "Delete Failed",
        description: error.message || "Unknown error",
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
      title={`Delete "${pool.name}"?`}
      showSubmit={true}
      isDestructive={true}
      loading={isDeleting}
      open={isOpen}
      setOpen={setIsOpen}
      onSubmit={onDeletePool}
      onCancel={async () => true}
      trigger={
        <IconButton aria-label="Delete round pool" size="xs" variant="outline" colorPalette="red">
          <FaTrash />
        </IconButton>
      }
      formBody={
        <VStack gap={3} py={2}>
          {roundCount > 0 && (
            <Text fontSize="sm" textAlign="center" color="fg">
              {roundCount} round{roundCount !== 1 ? "s are" : " is"} currently assigned to this pool and will become ungrouped.
            </Text>
          )}
          <Text fontSize="sm" textAlign="center" color="fg.error" fontWeight="heavy">
            THIS CANNOT BE UNDONE. Are you sure you want to proceed?
          </Text>
        </VStack>
      }
    />
  );
}
