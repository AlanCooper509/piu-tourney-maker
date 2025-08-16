import {
    Button,
    CloseButton,
    Dialog,
    Portal,
} from "@chakra-ui/react";

import type { ReactNode } from "react";

interface DialogFormProps {
  title: string;
  trigger: ReactNode; // element that opens the dialog
  onSubmit: () => void; // called when form is submitted
  children: ReactNode;  // form fields
}

export default function DialogForm({ title, trigger, onSubmit, children }: DialogFormProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{children}</Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button colorPalette={"red"}>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette={"green"} onClick={onSubmit}>Submit</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}