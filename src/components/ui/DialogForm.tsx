import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
} from "@chakra-ui/react";

import type { ReactNode } from "react";

interface DialogFormProps {
  title: string;
  trigger: ReactNode; // element that opens the dialog
  formBody: ReactNode;  // form fields
  showSubmit?: boolean;
  open: boolean;       // control dialog open state
  setOpen: (open: boolean) => void; // function to set open state
  onSubmit: () => Promise<boolean>;  // Return true to close, false to keep open
  onCancel: () => void;  // function to call on cancel
}

export default function DialogForm({ title, trigger, formBody, showSubmit = true, open, setOpen, onSubmit, onCancel }: DialogFormProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)} closeOnInteractOutside={false} modal={false}>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Portal>
        <Box className="dark">
          <Dialog.Backdrop />
          <Dialog.Positioner pointerEvents="none">
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>{formBody}</Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" borderWidth="2px" colorPalette={"red"} onClick={onCancel}>
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>

                <Button
                  variant="outline"
                  borderWidth="2px"
                  display={showSubmit ? 'inline-flex' : 'none'}
                  colorPalette={"green"} 
                  onClick={async () => {
                    const shouldClose = await onSubmit();
                    if (shouldClose) setOpen(false);
                  }}>
                  Submit
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  onClick={() => {
                    onCancel();
                    setOpen(false);
                  }}
                />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Box>
      </Portal>
    </Dialog.Root>
  );
}