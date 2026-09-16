import { Field, Input, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";

import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import { handleAddRoundPool } from "../../../handlers/roundpool/handleAddRoundPool";
import { handleUpdateRoundPoolName } from "../../../handlers/roundpool/handleUpdateRoundPoolName";

import type { RoundPool } from "../../../types/RoundPool";

interface RoundPoolModalProps {
  tourneyId: number;
  pool?: RoundPool; // when set, renames this pool instead of creating a new one
  nextSortOrder: number; // sort_order assigned to a newly created pool
  trigger: React.ReactNode;
  onSaved: (pool: RoundPool) => void;
}

export default function RoundPoolModal({
  tourneyId,
  pool,
  nextSortOrder,
  trigger,
  onSaved,
}: RoundPoolModalProps) {
  const isEditMode = !!pool;
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState(pool?.name ?? "");

  useEffect(() => {
    setFormName(pool?.name ?? "");
  }, [pool]);

  const submitWithGuards = async () => {
    if (!formName.trim()) {
      toaster.create({
        title: "Missing Name",
        description: "Give this round pool a name.",
        type: "error",
        closable: true,
      });
      return false;
    }

    try {
      const saved = isEditMode
        ? await handleUpdateRoundPoolName(pool!.id, formName)
        : await handleAddRoundPool(tourneyId, formName, nextSortOrder);

      onSaved(saved);
      toaster.create({
        title: isEditMode ? "Pool Renamed" : "Pool Added",
        description: `Round pool ${isEditMode ? "renamed" : "added"} successfully.`,
        type: "success",
        closable: true,
      });
      return true;
    } catch (err: any) {
      toaster.create({
        title: "Failed to Save Pool",
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
      return false;
    }
  };

  const formBody = (
    <VStack gap={4} align="stretch">
      <Field.Root>
        <Field.Label>Pool Name</Field.Label>
        <Input
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="e.g. Winners Bracket"
        />
      </Field.Root>
    </VStack>
  );

  return (
    <DialogForm
      title={isEditMode ? "Rename Round Pool" : "Add Round Pool"}
      trigger={trigger}
      onSubmit={submitWithGuards}
      onCancel={() => setOpen(false)}
      formBody={formBody}
      open={open}
      setOpen={setOpen}
    />
  );
}
