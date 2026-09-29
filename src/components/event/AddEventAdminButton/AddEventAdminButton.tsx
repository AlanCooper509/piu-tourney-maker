import { Field, IconButton, Input, Text } from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";
import { useState } from "react";

import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import handleAddEventAdmin from "../../../handlers/handleAddEventAdmin";

import type { UserProfile } from "../../../types/UserProfile";

interface AddEventAdminButtonProps {
  eventId: number;
  onAdded: (organizer: UserProfile) => void;
}

export default function AddEventAdminButton({ eventId, onAdded }: AddEventAdminButtonProps) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const button = (
    <IconButton
      aria-label="Add Event Admin"
      size="sm"
      variant="outline"
      borderWidth={2}
      colorPalette="green"
      px={2}
      ml={4}
      mt={2}
    >
      <Text fontSize={"md"}>Add Event Admin</Text>
      <IoAddCircleSharp />
    </IconButton>
  );

  const formBody = (
    <Field.Root>
      <Field.Label>Display Name</Field.Label>
      <Input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Enter their display name"
      />
      <Field.HelperText>
        They need to have signed up already. Names aren't case-sensitive.
      </Field.HelperText>
    </Field.Root>
  );

  async function onSubmit() {
    if (!displayName.trim()) {
      toaster.create({ title: "Error", description: "Enter a display name!", type: "error", closable: true });
      return false;
    }

    setSubmitting(true);
    try {
      const organizer = await handleAddEventAdmin(eventId, displayName);
      onAdded(organizer);
      toaster.create({
        title: "Event admin added",
        description: `${organizer.display_name} is now an event admin.`,
        type: "success",
        closable: true,
      });
      setDisplayName("");
      return true;
    } catch (error) {
      toaster.create({
        title: "Error",
        // supabase errors aren't always Error instances, so read the message directly
        description: (error as { message?: string })?.message ?? "Could not add event admin.",
        type: "error",
        closable: true,
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogForm
      title="Add Event Admin"
      trigger={button}
      formBody={formBody}
      loading={submitting}
      open={open}
      setOpen={setOpen}
      onSubmit={onSubmit}
      onCancel={() => setDisplayName("")}
    />
  );
}
