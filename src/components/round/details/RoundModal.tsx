import { Field, Input, NumberInput, Select, VStack, createListCollection } from "@chakra-ui/react";
import { useState } from "react";

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
  onSubmitForm: (name: string, advancing: number, nextId: number | undefined) => void;
}

export default function RoundModal({ round, rounds, roundName, setRoundName, playersAdvancing, setPlayersAdvancing, trigger, onSubmitForm }: RoundModalProps) {
  const [formRoundName, setFormRoundName] = useState(roundName);
  const [formPlayersAdvancing, setFormPlayersAdvancing] = useState(playersAdvancing.toString());
  const [formNextRound, setFormNextRound] = useState(round?.next_round_id ? [round.next_round_id.toString()] : []);

  const submitWithGuards = () => {
    if (!formRoundName.trim()) {
      toaster.create({
        title: "Invalid Round Name",
        description: "Round name cannot be empty.",
        type: "error",
        closable: true,
      });
      return;
    }
    const advancing = Number(formPlayersAdvancing);
    if (isNaN(advancing)) {
      toaster.create({
        title: "Invalid Players Advancing",
        description: "Players advancing must be a number.",
        type: "error",
        closable: true,
      });
      return;
    }
    if (advancing < 1) {
      toaster.create({
        title: "Invalid Players Advancing",
        description: "Players advancing must be at least 1.",
        type: "error",
        closable: true,
      });
      return;
    }
    const nextRoundId = formNextRound ? Number(formNextRound[0]) : undefined;
    setRoundName(formRoundName);
    setPlayersAdvancing(advancing);
    console.log(formNextRound);
    onSubmitForm(formRoundName, advancing, nextRoundId);
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
    </VStack>
  );

  return (
    <DialogForm
      title="Round Information"
      trigger={trigger}
      onSubmit={submitWithGuards}
      formBody={formBody}
    />
  );
}