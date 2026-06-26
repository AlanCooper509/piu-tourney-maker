import { useState } from "react";
import { Popover, Portal, Button, type ListCollection, IconButton } from "@chakra-ui/react";
import { MdOutlinePersonAddAlt } from "react-icons/md";

import { PlayerForm } from "./PlayerEntry/PlayerForm";

interface AddPlayerProps {
  onAdd: (name: string, seed: number | null) => Promise<void>;
  newName: string;
  setNewName: (name: string) => void;
  loading: boolean;
  collection?: ListCollection<{ label: string; value: string }>;
  hideSeed?: boolean;
  text?: string;
}

export default function AddPlayer({ onAdd, newName, setNewName, loading, collection, hideSeed = false, text }: AddPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newSeed, setNewSeed] = useState<string>("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const seedValue = newSeed.trim() !== "" ? Number(newSeed) : null;
    await onAdd(newName.trim(), seedValue);
    
    setNewName("");
    setNewSeed("");
    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} positioning={{ placement: "bottom" }}>
      <Popover.Trigger asChild>
        {text ? 
          <Button
            aria-label="Add player"
            variant="outline"
            borderWidth={2}
            size="sm"
            colorPalette="green"
          >
            {text}<MdOutlinePersonAddAlt />
          </Button>
          :
          <IconButton
            aria-label="Add player"
            variant="outline"
            borderWidth={2}
            size="sm"
            colorPalette="green"
          >
            <MdOutlinePersonAddAlt />
          </IconButton>
        }
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content p={4} w="300px" boxShadow="md">
            <Popover.Arrow />
            <PlayerForm
              name={newName}
              setName={setNewName}
              seed={newSeed}
              setSeed={setNewSeed}
              onSubmit={handleSave}
              onCancel={() => setIsOpen(false)}
              submitLabel="Add"
              loading={loading}
              collection={collection}
              hideSeed={hideSeed}
            />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}