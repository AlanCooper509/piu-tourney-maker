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
  formBody: ReactNode;  // form fields
}

export default function DialogForm({ title, trigger, onSubmit, formBody }: DialogFormProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{formBody}</Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" borderWidth="2px" colorPalette={"red"}>Cancel</Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" borderWidth="2px" colorPalette={"green"} onClick={onSubmit}>Submit</Button>
              </Dialog.ActionTrigger>
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