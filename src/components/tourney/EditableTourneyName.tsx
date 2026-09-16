import { Field, HStack, IconButton, Input, Text } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import { useEffect, useState } from "react";

import DialogForm from "../ui/DialogForm";
import { toaster } from "../ui/toaster";

function EditableTourneyName({
  tourneyName,
  onRename,
  isLoading = false
}: {
  tourneyName: string;
  onRename: (newName: string) => Promise<void>;
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(tourneyName);

  useEffect(() => {
    if (open) setNewName(tourneyName);
  }, [open, tourneyName]);

  const submitWithGuards = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toaster.create({
        title: "Invalid Name",
        description: "Tourney name cannot be empty.",
        type: "error",
        closable: true,
      });
      return false;
    }

    try {
      await onRename(trimmed);
      toaster.create({
        title: "Tourney Renamed",
        description: `Tourney name updated to "${trimmed}"`,
        type: "success",
        closable: true,
      });
      return true;
    } catch (err: any) {
      toaster.create({
        title: "Failed to rename tourney",
        description: err.message || "An error occurred",
        type: "error",
        closable: true,
      });
      return false;
    }
  };

  const formBody = (
    <Field.Root>
      <Field.Label>Tourney Name</Field.Label>
      <Input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
    </Field.Root>
  );

  return (
    <HStack w="fit-content" mx="auto" mb={4} gap={2}>
      <Text fontWeight="semibold">{tourneyName}</Text>
      <DialogForm
        title="Edit Tourney Name"
        trigger={
          <IconButton
            aria-label="Edit tourney name"
            colorPalette="blue"
            variant="outline"
            borderWidth={2}
            size="sm"
          >
            <CiEdit />
          </IconButton>
        }
        onSubmit={submitWithGuards}
        onCancel={() => setOpen(false)}
        formBody={formBody}
        open={open}
        setOpen={setOpen}
        loading={isLoading}
      />
    </HStack>
  );
}

export default EditableTourneyName;
