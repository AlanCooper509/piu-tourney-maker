import { Field, IconButton, Input, Select, Stack, createListCollection } from "@chakra-ui/react";
import { IoSettingsOutline } from "react-icons/io5";
import { useEffect, useState } from "react";

import DialogForm from "../ui/DialogForm";
import { toaster } from "../ui/toaster";
import { parseRoomName } from "../../lib/ddrTools";
import { tourneyTypes } from "../../types/Tourney";

import type { TourneyDetailsUpdate } from "../../handlers/handleUpdateTourneyDetails";
import type { TourneyStatus, TourneyType } from "../../types/Tourney";
import type { Round } from "../../types/Round";

const tourneyTypeCollection = createListCollection({
  items: tourneyTypes.map((type) => ({
    label: type,
    value: type,
  })),
});

function EditTourneyDetails({
  tourneyName,
  tourneyType,
  tourneyStatus,
  rounds,
  ddrToolsRoom,
  onSave,
  isLoading = false
}: {
  tourneyName: string;
  tourneyType: TourneyType | null;
  tourneyStatus: TourneyStatus | null | undefined;
  rounds: Round[] | null;
  ddrToolsRoom: string | null;
  onSave: (details: TourneyDetailsUpdate) => Promise<void>;
  isLoading?: boolean;
}) {
  // Only offered pre-start, matching Generate Bracket/Start Tourney. Changing
  // it while rounds already exist wipes them - same as Regenerate Bracket -
  // which onSave does via a delete cascade, so it's fine to allow here too as
  // long as that's made explicit before they commit to it.
  const formatIsEditable = tourneyStatus === "Not Started";
  const roundCount = rounds?.length ?? 0;

  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(tourneyName);
  const [newType, setNewType] = useState<string[]>(tourneyType ? [tourneyType] : []);
  const [newDdrToolsRoom, setNewDdrToolsRoom] = useState(ddrToolsRoom ?? "");

  const changingFormat = formatIsEditable && roundCount > 0 && newType[0] !== tourneyType;

  useEffect(() => {
    if (open) {
      setNewName(tourneyName);
      setNewType(tourneyType ? [tourneyType] : []);
      setNewDdrToolsRoom(ddrToolsRoom ?? "");
    }
  }, [open, tourneyName, tourneyType, ddrToolsRoom]);

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

    if (formatIsEditable && newType.length === 0) {
      toaster.create({
        title: "Invalid Format",
        description: "Select a tourney format.",
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
      await onSave({
        name: trimmedName,
        ddrToolsRoom: trimmedDdrToolsRoom || null,
        ...(formatIsEditable ? { type: newType[0] as TourneyType } : {}),
      });
      toaster.create({
        title: "Tourney Updated",
        description: changingFormat
          ? `Tourney details updated. ${roundCount} round${roundCount === 1 ? "" : "s"} deleted.`
          : "Tourney details updated.",
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
      {formatIsEditable && (
        <Field.Root>
          <Select.Root
            collection={tourneyTypeCollection}
            value={newType}
            onValueChange={({ value }) => setNewType(value)}
            size="sm"
          >
            <Select.HiddenSelect />
            <Select.Label>Tourney Format</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Choose format" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.ClearTrigger />
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {tourneyTypeCollection.items.map((type) => (
                  <Select.Item item={type} key={type.value}>
                    {type.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          {changingFormat && (
            <Field.HelperText color="orange.500">
              This tourney already has {roundCount} round{roundCount === 1 ? "" : "s"}.
              Changing the format will delete all of them.
            </Field.HelperText>
          )}
        </Field.Root>
      )}
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
