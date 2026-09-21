import { Field, IconButton, Input, Stack } from "@chakra-ui/react";
import { IoSettingsOutline } from "react-icons/io5";
import { useEffect, useState } from "react";

import DialogForm from "../ui/DialogForm";
import { toaster } from "../ui/toaster";
import { parseRoomName } from "../../lib/ddrTools";

import type { TourneyDetailsUpdate } from "../../handlers/handleUpdateTourneyDetails";

function EditTourneyDetails({
  tourneyName,
  ddrToolsRoom,
  onSave,
  isLoading = false
}: {
  tourneyName: string;
  ddrToolsRoom: string | null;
  onSave: (details: TourneyDetailsUpdate) => Promise<void>;
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(tourneyName);
  const [newDdrToolsRoom, setNewDdrToolsRoom] = useState(ddrToolsRoom ?? "");

  useEffect(() => {
    if (open) {
      setNewName(tourneyName);
      setNewDdrToolsRoom(ddrToolsRoom ?? "");
    }
  }, [open, tourneyName, ddrToolsRoom]);

  const submitWithGuards = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      toaster.create({
        title: "Invalid Name",
        description: "Tourney name cannot be empty.",
        type: "error",
        closable: true,
      });
      return false;
    }

    const trimmedDdrToolsRoom = newDdrToolsRoom.trim();
    if (trimmedDdrToolsRoom && !parseRoomName(trimmedDdrToolsRoom)) {
      toaster.create({
        title: "Invalid ddr.tools link",
        description: "That doesn't look like a ddr.tools event link or room name.",
        type: "error",
        closable: true,
      });
      return false;
    }

    try {
      await onSave({ name: trimmedName, ddrToolsRoom: trimmedDdrToolsRoom || null });
      toaster.create({
        title: "Tourney Updated",
        description: `Tourney details updated.`,
        type: "success",
        closable: true,
      });
      return true;
    } catch (err: any) {
      toaster.create({
        title: "Failed to update tourney",
        description: err.message || "An error occurred",
        type: "error",
        closable: true,
      });
      return false;
    }
  };

  const formBody = (
    <Stack gap={4}>
      <Field.Root>
        <Field.Label>Tourney Name</Field.Label>
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
      </Field.Root>
      <Field.Root>
        <Field.Label>ddr.tools Event Link (optional)</Field.Label>
        <Input
          value={newDdrToolsRoom}
          onChange={(e) => setNewDdrToolsRoom(e.target.value)}
          placeholder="https://ddr.tools/e/my-event"
        />
        <Field.HelperText>
          Lets this tourney pull results from a ddr.tools event room.
        </Field.HelperText>
      </Field.Root>
    </Stack>
  );

  return (
    <DialogForm
      title="Edit Tourney Details"
      trigger={
        <IconButton
          aria-label="Edit tourney details"
          variant="outline"
          borderWidth={2}
          size="sm"
          px={2}
        >
          Settings <IoSettingsOutline />
        </IconButton>
      }
      onSubmit={submitWithGuards}
      onCancel={() => setOpen(false)}
      formBody={formBody}
      open={open}
      setOpen={setOpen}
      loading={isLoading}
    />
  );
}

export default EditTourneyDetails;
