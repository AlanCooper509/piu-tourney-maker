import { Checkbox, createListCollection, Field, Input, Select, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";

import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import type { Round } from "../../../types/Round";
import type { RoundPool } from "../../../types/RoundPool";

const UNGROUPED = "__ungrouped__";

interface RoundModalProps {
  round?: Round;
  rounds?: Round[];
  roundPools?: RoundPool[];
  trigger: React.ReactNode;
  onSubmitForm: (
    name: string,
    pointsPerStage: string | undefined,
    roundPoolId: number | null | undefined
  ) => void;
}

export default function RoundModal({
  round,
  roundPools = [],
  trigger,
  onSubmitForm,
}: RoundModalProps) {
  const [open, setOpen] = useState(false);

  // Form state
  const [formRoundName, setFormRoundName] = useState(round?.name ?? "");
  const [formPointsPerStage, setFormPointsPerStage] = useState<string>(round?.points_per_stage ?? "");
  const [pointsScoringChecked, setPointsScoringChecked] = useState(round?.points_per_stage != null);
  const [formRoundPoolId, setFormRoundPoolId] = useState<string[]>(
    [round?.round_pool_id ? String(round.round_pool_id) : UNGROUPED]
  );

  // Sync form state whenever the round changes
  useEffect(() => {
    setFormRoundName(round?.name ?? "");
    setFormPointsPerStage(round?.points_per_stage ?? "");
    setPointsScoringChecked(!!round?.points_per_stage);
    setFormRoundPoolId([round?.round_pool_id ? String(round.round_pool_id) : UNGROUPED]);
  }, [round]);

  const submitWithGuards = async () => {
    if (!formRoundName) {
      toaster.create({
        title: "Invalid Round Name",
        description: "Round name cannot be empty.",
        type: "error",
        closable: true,
      });
      return false;
    }

    const selectedPool = formRoundPoolId[0];
    const roundPoolId = !selectedPool || selectedPool === UNGROUPED ? null : Number(selectedPool);

    onSubmitForm(formRoundName, formPointsPerStage, roundPoolId);
    return true;
  };

  const roundPoolOptions = createListCollection({
    items: [
      { label: "Ungrouped", value: UNGROUPED },
      ...roundPools.map((pool) => ({ label: pool.name, value: String(pool.id) })),
    ],
  });

  const formBody = (
    <VStack gap={4} align="stretch">
      <Field.Root>
        <Field.Label>Round Name</Field.Label>
        <Input value={formRoundName} onChange={(e) => setFormRoundName(e.target.value)} />
      </Field.Root>

      {roundPools.length > 0 && (
        <Field.Root>
          <Select.Root
            collection={roundPoolOptions}
            value={formRoundPoolId}
            onValueChange={({ value }) => setFormRoundPoolId(value)}
            size="sm"
          >
            <Select.HiddenSelect />
            <Select.Label>Round Pool</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Choose round pool" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {roundPoolOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>
      )}

      {/* Points Based Scoring */}
      <>
        <Checkbox.Root
          checked={pointsScoringChecked}
          onCheckedChange={(e) => {
            setPointsScoringChecked(!!e.checked);
            if (!e.checked) setFormPointsPerStage("");
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