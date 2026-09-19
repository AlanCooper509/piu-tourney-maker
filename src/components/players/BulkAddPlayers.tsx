import { useMemo, useState } from "react";
import { Box, IconButton, Text, Textarea, VStack } from "@chakra-ui/react";
import { MdOutlineGroupAdd } from "react-icons/md";

import DialogForm from "../ui/DialogForm";
import { toaster } from "../ui/toaster";
import { parseBulkPlayerInput } from "../../helpers/parseBulkPlayerInput";

interface BulkAddPlayersProps {
  onBulkAdd: (entries: { name: string; seed: number | null }[]) => Promise<void>;
  existingPlayerNames: Set<string>; // lowercase player names already in this tourney
  loading: boolean;
}

export default function BulkAddPlayers({ onBulkAdd, existingPlayerNames, loading }: BulkAddPlayersProps) {
  const [open, setOpen] = useState(false);
  const [rawInput, setRawInput] = useState("");

  const parsed = useMemo(() => parseBulkPlayerInput(rawInput), [rawInput]);

  const { newEntries, alreadyExists } = useMemo(() => {
    const newEntries: typeof parsed.entries = [];
    const alreadyExists: typeof parsed.entries = [];
    parsed.entries.forEach((entry) => {
      if (existingPlayerNames.has(entry.name.toLowerCase())) {
        alreadyExists.push(entry);
      } else {
        newEntries.push(entry);
      }
    });
    return { newEntries, alreadyExists };
  }, [parsed, existingPlayerNames]);

  const submitWithGuards = async () => {
    if (!newEntries.length) {
      toaster.create({
        title: "No players to add",
        description: "Enter at least one new player name.",
        type: "error",
        closable: true,
      });
      return false;
    }

    await onBulkAdd(newEntries.map(({ name, seed }) => ({ name, seed })));
    setRawInput("");
    return true;
  };

  const formBody = (
    <VStack align="stretch" gap={3}>
      <Text fontSize="sm" color="fg.muted">
        One player per line. Optionally add a seed after a comma, e.g. "TUSA, 1".
      </Text>
      <Textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder={"TUSA, 1\nBob\nPureWasian, 3"}
        rows={10}
        fontFamily="mono"
        fontSize="sm"
        autoFocus
      />
      <Box fontSize="xs" color="fg.muted" minH="1em">
        {newEntries.length > 0 && (
          <Text>{newEntries.length} player{newEntries.length === 1 ? "" : "s"} ready to add.</Text>
        )}
        {alreadyExists.length > 0 && (
          <Text color="orange.400">
            Skipping {alreadyExists.length} already in this tourney: {alreadyExists.map((e) => e.name).join(", ")}
          </Text>
        )}
        {parsed.duplicateLines.length > 0 && (
          <Text color="orange.400">
            Skipping {parsed.duplicateLines.length} duplicate line{parsed.duplicateLines.length === 1 ? "" : "s"} in input.
          </Text>
        )}
      </Box>
    </VStack>
  );

  return (
    <DialogForm
      title="Bulk Add Players"
      trigger={
        <IconButton
          aria-label="Bulk add players"
          variant="outline"
          borderWidth={2}
          px={2}
          size="sm"
          colorPalette="green"
        >
          Bulk Add <MdOutlineGroupAdd />
        </IconButton>
      }
      onSubmit={submitWithGuards}
      onCancel={() => setOpen(false)}
      formBody={formBody}
      open={open}
      setOpen={setOpen}
      loading={loading}
    />
  );
}
