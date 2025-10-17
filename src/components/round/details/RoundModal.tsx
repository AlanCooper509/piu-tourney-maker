import { Checkbox, Field, Input, NumberInput, Select, VStack, createListCollection } from "@chakra-ui/react";
import { useState } from "react";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import type { Round } from "../../../types/Round";

interface RoundModalProps {
  round?: Round;
  rounds?: Round[];
  roundName: string;
  setRoundName: (name: string) => void;
  playersAdvancing: number;
  setPlayersAdvancing: (count: number) => void;
  trigger: React.ReactNode;
  onSubmitForm: (name: string, advancing: number, nextId: number | undefined, parentId: number | undefined) => void;
}

export default function RoundModal({ round, rounds, roundName, setRoundName, playersAdvancing, setPlayersAdvancing, trigger, onSubmitForm }: RoundModalProps) {
  const { tourney } = useCurrentTourney();

  const [open, setOpen] = useState(false);
  const [formRoundName, setFormRoundName] = useState(roundName);
  const [formPlayersAdvancing, setFormPlayersAdvancing] = useState(playersAdvancing.toString());
  const [formNextRound, setFormNextRound] = useState(round?.next_round_id ? [round.next_round_id.toString()] : []);
  const [formParentRoundId, setFormParentRound] = useState(round?.parent_round_id ? [round.parent_round_id.toString()] : []);
  const [checked, setChecked] = useState(round?.parent_round_id != null);

  const submitWithGuards = async () => {
    if (!formRoundName.trim()) {
      toaster.create({
        title: "Invalid Round Name",
        description: "Round name cannot be empty.",
        type: "error",
        closable: true,
      });
      return false; // Prevent form submission
    }
    const advancing = Number(formPlayersAdvancing);
    if (isNaN(advancing)) {
      toaster.create({
        title: "Invalid Players Advancing",
        description: "Players advancing must be a number.",
        type: "error",
        closable: true,
      });
      return false; // Prevent form submission
    }
    if (advancing < 1) {
      toaster.create({
        title: "Invalid Players Advancing",
        description: "Players advancing must be at least 1.",
        type: "error",
        closable: true,
      });
      return false; // Prevent form submission
    }
    const nextRoundId = formNextRound ? Number(formNextRound[0]) : undefined;
    const parentRoundId = formParentRoundId ? Number(formParentRoundId[0]) : undefined;
    setRoundName(formRoundName);
    setPlayersAdvancing(advancing);
    onSubmitForm(formRoundName, advancing, nextRoundId, parentRoundId);
    return true; // Close the form
  }

  const otherRounds = createListCollection({
    items: (rounds ?? [])
      .filter(r => r.id !== round?.id) // also guard round being undefined
      .map(r => ({
        label: r.name,
        value: r.id.toString(),
      })),
  });

  const defaultNextRoundField = rounds?.find(r => r.id === round?.next_round_id);
  const defaultParentRoundField = rounds?.find(r => r.id === round?.parent_round_id);

  const formBody = (
    <VStack gap={4} align="stretch">
      <Field.Root>
        <Field.Label>Round Name</Field.Label>
        <Input
          value={formRoundName}
          onChange={(e) => setFormRoundName(e.target.value)}
          placeholder="Enter round name"
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Players Advancing</Field.Label>
        <NumberInput.Root
          defaultValue={formPlayersAdvancing}
          onValueChange={(e) => setFormPlayersAdvancing(e.value)}
          min={1}
        >
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
        {/* <Field.HelperText ms={1}>Number of players advancing</Field.HelperText> */}
      </Field.Root>

      <Field.Root>
        <Select.Root
          collection={otherRounds}
          defaultValue={defaultNextRoundField ? [defaultNextRoundField.id.toString()] : []}
          onValueChange={({ value }) => setFormNextRound(value)}
          size="sm"
        >
          <Select.HiddenSelect />
          <Select.Label>Next Round</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Choose next round name" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.ClearTrigger />
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {otherRounds.items.map((otherRound) => (
                <Select.Item item={otherRound} key={otherRound.value}>
                  {otherRound.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      {(tourney?.type == "Waterfall (Redemption)" || round?.parent_round_id != null) && (
        <>
          <Checkbox.Root
            checked={checked}
            onCheckedChange={(e) => setChecked(!!e.checked)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Is this a Redemption round?</Checkbox.Label>
          </Checkbox.Root>
          { checked &&  (
            <Field.Root>
              <Select.Root
                collection={otherRounds}
                defaultValue={defaultParentRoundField ? [defaultParentRoundField.id.toString()] : []}
                onValueChange={({ value }) => setFormParentRound(value)}
                size="sm"
              >
                <Select.HiddenSelect />
                <Select.Label>Parent Round</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Choose parent round name" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.ClearTrigger />
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {otherRounds.items.map((otherRound) => (
                      <Select.Item item={otherRound} key={otherRound.value}>
                        {otherRound.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Field.Root>
          )}
        </>
      )}
    </VStack>
  );

  return (
    <DialogForm
      title="Round Information"
      trigger={trigger}
      onSubmit={async () => submitWithGuards()}
      onCancel={() => {
        // Reset form fields to current props values
        setFormRoundName(roundName);
        setFormPlayersAdvancing(playersAdvancing.toString());
        setFormNextRound(round?.next_round_id ? [round.next_round_id.toString()] : []);
        setFormParentRound(round?.parent_round_id ? [round.parent_round_id.toString()] : []);
        setOpen(false);
      }}
      formBody={formBody}
      open={open}
      setOpen={setOpen}
    />
  );
}