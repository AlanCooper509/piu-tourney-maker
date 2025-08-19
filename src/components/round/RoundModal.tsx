import { Field, Input, VStack } from "@chakra-ui/react";

import DialogForm from "../ui/DialogForm";
import { toaster } from "../ui/toaster";

interface RoundModalProps {
  roundName: string;
  setRoundName: (name: string) => void;
  playersAdvancing: number;
  setPlayersAdvancing: (count: number) => void;
  trigger: React.ReactNode;
  admin: boolean;
  adminLoading?: boolean;
  onSubmitForm: () => void;
}

export default function RoundModal({ roundName, setRoundName, playersAdvancing, setPlayersAdvancing, trigger, admin, adminLoading, onSubmitForm }: RoundModalProps) {
    if (adminLoading || !admin) return null;
    const submitWithGuards = () => {
      if (!roundName.trim()) {
        toaster.create({
          title: "Invalid Round Name",
          description: "Round name cannot be empty.",
          type: "error",
          closable: true,
        });
        return;
      }
      if (playersAdvancing < 1) {
        toaster.create({
          title: "Invalid Players Advancing",
          description: "Players advancing must be at least 1.",
          type: "error",
          closable: true,
        });
        return;
      }
      onSubmitForm();
    }

    return (
      <DialogForm
        title="Round Information"
        trigger={trigger}
        onSubmit={submitWithGuards}
      >
        {/* Form fields as children */}
        <VStack gap={4} align="stretch">
          <Field.Root>
            <Field.Label>Round Name</Field.Label>
            <Input
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="Enter round name"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Players Advancing</Field.Label>
            <Input
              type="number"
              value={playersAdvancing}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 1) {
                  setPlayersAdvancing(value);
                }
              }}
              placeholder="Enter number of players advancing"
              min={1}
            />
          </Field.Root>
        </VStack>
      </DialogForm>
    );
}