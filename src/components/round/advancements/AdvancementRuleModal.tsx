import { Checkbox, Field, HStack, Input, NumberInput, Select, VStack, createListCollection } from "@chakra-ui/react";
import { useState, useEffect } from "react";

import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import { handleAddRoundAdvancement, handleUpdateRoundAdvancement } from "../../../handlers/round/handleRoundAdvancementRow";
import { rangesOverlap } from "../../../helpers/resolveAdvancementDestination";

import type { Round } from "../../../types/Round";
import type { RoundAdvancement } from "../../../types/RoundAdvancement";

interface AdvancementRuleModalProps {
  round: Round;
  rounds: Round[];
  existingRules: RoundAdvancement[]; // all other rules for this round (for overlap validation)
  rule?: RoundAdvancement; // when set, edits this rule instead of creating a new one
  trigger: React.ReactNode;
  onSaved: (rule: RoundAdvancement) => void;
}

export default function AdvancementRuleModal({
  round,
  rounds,
  existingRules,
  rule,
  trigger,
  onSaved,
}: AdvancementRuleModalProps) {
  const isEditMode = !!rule;
  const [open, setOpen] = useState(false);

  const [formRankStart, setFormRankStart] = useState(rule?.rank_start?.toString() ?? "1");
  const [formOpenEnded, setFormOpenEnded] = useState(rule ? rule.rank_end == null : false);
  const [formRankEnd, setFormRankEnd] = useState(rule?.rank_end?.toString() ?? "");
  const [formDestinationRoundId, setFormDestinationRoundId] = useState<string[]>(
    rule ? [rule.destination_round_id.toString()] : []
  );
  const [formLabel, setFormLabel] = useState(rule?.label ?? "");

  useEffect(() => {
    setFormRankStart(rule?.rank_start?.toString() ?? "1");
    setFormOpenEnded(rule ? rule.rank_end == null : false);
    setFormRankEnd(rule?.rank_end?.toString() ?? "");
    setFormDestinationRoundId(rule ? [rule.destination_round_id.toString()] : []);
    setFormLabel(rule?.label ?? "");
  }, [rule]);

  const submitWithGuards = async () => {
    const rankStart = Number(formRankStart);
    if (!Number.isInteger(rankStart) || rankStart < 1) {
      toaster.create({
        title: "Invalid Rank Start",
        description: "Rank start must be a whole number >= 1.",
        type: "error",
        closable: true,
      });
      return false;
    }

    const rankEnd = formOpenEnded ? null : Number(formRankEnd);
    if (!formOpenEnded && (!Number.isInteger(rankEnd) || (rankEnd as number) < rankStart)) {
      toaster.create({
        title: "Invalid Rank End",
        description: "Rank end must be a whole number >= rank start (or mark it open-ended).",
        type: "error",
        closable: true,
      });
      return false;
    }

    const destinationRoundId = formDestinationRoundId?.[0] ? Number(formDestinationRoundId[0]) : undefined;
    if (!destinationRoundId) {
      toaster.create({
        title: "Missing Destination Round",
        description: "Choose which round this placement advances to.",
        type: "error",
        closable: true,
      });
      return false;
    }

    const candidate = { rank_start: rankStart, rank_end: rankEnd };
    const conflicting = existingRules.find(
      other => other.id !== rule?.id && rangesOverlap(candidate, other)
    );
    if (conflicting) {
      toaster.create({
        title: "Overlapping Ranks",
        description: `This range overlaps an existing rule (rank ${conflicting.rank_start}${conflicting.rank_end ? `-${conflicting.rank_end}` : "+"}).`,
        type: "error",
        closable: true,
      });
      return false;
    }

    try {
      const saved = isEditMode
        ? await handleUpdateRoundAdvancement(rule!.id, rankStart, rankEnd, destinationRoundId, formLabel || undefined)
        : await handleAddRoundAdvancement(round.id, rankStart, rankEnd, destinationRoundId, formLabel || undefined);

      onSaved(saved);
      toaster.create({
        title: isEditMode ? "Rule Updated" : "Rule Added",
        description: `Advancement rule ${isEditMode ? "updated" : "added"} successfully.`,
        type: "success",
        closable: true,
      });
      return true;
    } catch (err: any) {
      toaster.create({
        title: "Failed to Save Rule",
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
      return false;
    }
  };

  const destinationRounds = createListCollection({
    items: rounds
      .filter(r => r.id !== round.id)
      .map(r => ({ label: r.name, value: r.id.toString() })),
  });

  const formBody = (
    <VStack gap={4} align="stretch">
      <HStack gap={4} align="flex-start">
        <Field.Root>
          <Field.Label>Rank Start</Field.Label>
          <NumberInput.Root value={formRankStart} onValueChange={(e) => setFormRankStart(e.value)} min={1}>
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>

        {!formOpenEnded && (
          <Field.Root>
            <Field.Label>Rank End</Field.Label>
            <NumberInput.Root value={formRankEnd} onValueChange={(e) => setFormRankEnd(e.value)} min={Number(formRankStart) || 1}>
              <NumberInput.Control />
              <NumberInput.Input />
            </NumberInput.Root>
          </Field.Root>
        )}
      </HStack>

      <Checkbox.Root
        checked={formOpenEnded}
        onCheckedChange={(e) => setFormOpenEnded(!!e.checked)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Open-ended (this rank and everyone worse)</Checkbox.Label>
      </Checkbox.Root>

      <Field.Root>
        <Select.Root
          collection={destinationRounds}
          value={formDestinationRoundId}
          onValueChange={({ value }) => setFormDestinationRoundId(value)}
          size="sm"
        >
          <Select.HiddenSelect />
          <Select.Label>Destination Round</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Choose destination round" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.ClearTrigger />
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {destinationRounds.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>Label (optional)</Field.Label>
        <Input
          value={formLabel}
          onChange={(e) => setFormLabel(e.target.value)}
          placeholder="e.g. Winners, Losers Pool B"
        />
      </Field.Root>
    </VStack>
  );

  return (
    <DialogForm
      title={isEditMode ? `Edit Advancement Rule for ${round.name}` : `Add Advancement Rule for ${round.name}`}
      trigger={trigger}
      onSubmit={submitWithGuards}
      onCancel={() => setOpen(false)}
      formBody={formBody}
      open={open}
      setOpen={setOpen}
    />
  );
}
