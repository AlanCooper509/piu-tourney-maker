import { Checkbox, Field, Input, NumberInput, Select, VStack, createListCollection } from "@chakra-ui/react";
import { useState, useEffect } from "react";

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
  onSubmitForm: (
    name: string,
    advancing: number,
    nextId: number | undefined,
    parentId: number | undefined,
    pointsPerStage: string | undefined
  ) => void;
}

export default function RoundModal({
  round,
  rounds,
  roundName,
  setRoundName,
  playersAdvancing,
  setPlayersAdvancing,
  trigger,
  onSubmitForm,
}: RoundModalProps) {
  const { tourney } = useCurrentTourney();
  const [open, setOpen] = useState(false);

  // Form state
  const [formRoundName, setFormRoundName] = useState(roundName);
  const [formPlayersAdvancing, setFormPlayersAdvancing] = useState(playersAdvancing.toString());
  const [formNextRound, setFormNextRound] = useState<string[]>([]);
  const [formParentRoundId, setFormParentRound] = useState<string[]>([]);
  const [formPointsPerStage, setFormPointsPerStage] = useState<string | undefined>(undefined);
  const [redemptionChecked, setRedemptionChecked] = useState(false);
  const [pointsScoringChecked, setPointsScoringChecked] = useState(false);

  // Sync form state whenever the round changes
  useEffect(() => {
    setFormRoundName(roundName);
    setFormPlayersAdvancing(playersAdvancing.toString());
    setFormNextRound(round?.next_round_id ? [round.next_round_id.toString()] : []);
    setFormParentRound(round?.parent_round_id ? [round.parent_round_id.toString()] : []);
    setFormPointsPerStage(round?.points_per_stage);
    setRedemptionChecked(round?.parent_round_id != null);
    setPointsScoringChecked(round?.points_per_stage != null);
  }, [round, roundName, playersAdvancing]);

  const submitWithGuards = async () => {
    if (!formRoundName.trim()) {
      toaster.create({
        title: "Invalid Round Name",
        description: "Round name cannot be empty.",
        type: "error",
        closable: true,
      });
      return false;
    }

    const advancing = Number(formPlayersAdvancing);
    if (isNaN(advancing) || advancing < 1) {
      toaster.create({
        title: "Invalid Players Advancing",
        description: "Players advancing must be a number >= 1.",
        type: "error",
        closable: true,
      });
      return false;
    }

    const nextRoundId = formNextRound?.[0] ? Number(formNextRound[0]) : undefined;
    const parentRoundId = formParentRoundId?.[0] ? Number(formParentRoundId[0]) : undefined;

    setRoundName(formRoundName);
    setPlayersAdvancing(advancing);

    onSubmitForm(formRoundName, advancing, nextRoundId, parentRoundId, formPointsPerStage);
    return true;
  };

  const otherRounds = createListCollection({
    items: (rounds ?? [])
      .filter(r => r.id !== round?.id)
      .map(r => ({ label: r.name, value: r.id.toString() })),
  });

  const defaultNextRoundField = rounds?.find(r => r.id === round?.next_round_id);
  const defaultParentRoundField = rounds?.find(r => r.id === round?.parent_round_id);

  const formBody = (
    <VStack gap={4} align="stretch">
      <Field.Root>
        <Field.Label>Round Name</Field.Label>
        <Input value={formRoundName} onChange={(e) => setFormRoundName(e.target.value)} />
      </Field.Root>

      <Field.Root>
        <Field.Label>Players Advancing</Field.Label>
        <NumberInput.Root
          value={formPlayersAdvancing}
          onValueChange={(e) => setFormPlayersAdvancing(e.value)}
          min={1}
        >
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
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
                <Select.Item key={otherRound.value} item={otherRound}>
                  {otherRound.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      {(tourney?.type === "Waterfall (Redemption)" || round?.parent_round_id != null) && (
        <>
          <Checkbox.Root
            checked={redemptionChecked}
            onCheckedChange={(e) => setRedemptionChecked(!!e.checked)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Is this a Redemption round?</Checkbox.Label>
          </Checkbox.Root>

          {redemptionChecked && (
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
                      <Select.Item key={otherRound.value} item={otherRound}>
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

      {/* Points Based Scoring */}
      <>
        <Checkbox.Root
          checked={pointsScoringChecked}
          onCheckedChange={(e) => {
            setPointsScoringChecked(!!e.checked);
            if (!e.checked) setFormPointsPerStage(undefined);
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Points based scoring?</Checkbox.Label>
        </Checkbox.Root>
        {pointsScoringChecked && (
          <Field.Root>
            <Field.Label>Points Per Player</Field.Label>
            <Input
              value={formPointsPerStage}
              onChange={(e) => setFormPointsPerStage(e.target.value)}
              placeholder="Ex: 5,3,2,1 will assign 1st: 5 / 2nd: 3 / 3rd: 2 / 4th: 1 / Remaining: 0"
            />
          </Field.Root>
        )}
      </>
    </VStack>
  );

  return (
    <DialogForm
      title="Round Information"
      trigger={trigger}
      onSubmit={submitWithGuards}
      onCancel={() => setOpen(false)}
      formBody={formBody}
      open={open}
      setOpen={setOpen}
    />
  );
}