import { Checkbox, Field, Input, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";

import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import type { Round } from "../../../types/Round";

interface RoundModalProps {
  round?: Round;
  rounds?: Round[];
  trigger: React.ReactNode;
  onSubmitForm: (
    name: string,
    pointsPerStage: string | undefined
  ) => void;
}

export default function RoundModal({
  round,
  trigger,
  onSubmitForm,
}: RoundModalProps) {
  const [open, setOpen] = useState(false);

  // Form state
  const [formRoundName, setFormRoundName] = useState(round?.name ?? "");
  const [formPointsPerStage, setFormPointsPerStage] = useState<string>(round?.points_per_stage ?? "");
  const [pointsScoringChecked, setPointsScoringChecked] = useState(round?.points_per_stage != null);

  // Sync form state whenever the round changes
  useEffect(() => {
    setFormRoundName(round?.name ?? "");
    setFormPointsPerStage(round?.points_per_stage ?? "");
    setPointsScoringChecked(!!round?.points_per_stage);
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

    onSubmitForm(formRoundName, formPointsPerStage);
    return true;
  };

  const formBody = (
    <VStack gap={4} align="stretch">
      <Field.Root>
        <Field.Label>Round Name</Field.Label>
        <Input value={formRoundName} onChange={(e) => setFormRoundName(e.target.value)} />
      </Field.Root>

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