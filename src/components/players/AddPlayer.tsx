import { useState } from "react";
import {
  HStack,
  Input,
  IconButton,
  Combobox,
  Portal,
  type ListCollection
} from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";

interface AddPlayerProps {
  onAdd: (name: string) => Promise<any>;
  newName: string;
  setNewName: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  collection?: ListCollection<{ label: string; value: string }>;
}

function AddPlayer({
  onAdd,
  newName,
  setNewName,
  loading,
  collection
}: AddPlayerProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) return;
    await onAdd(newName.trim());
    setNewName("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewName("");
    setIsAdding(false);
  };

  return (
    <HStack align="center" justify="center">
      {isAdding ? (
        <>
          {collection ? (
            <Combobox.Root
              collection={collection}
              inputValue={newName}
              onInputValueChange={(e) => {
                setNewName(e.inputValue);
              }}
              onValueChange={(e) =>
                setNewName(e.value[0] ?? "")
              }
              size="sm"
            >
              <Combobox.Control>
                <Combobox.Input placeholder="Select or type..." />
                <Combobox.IndicatorGroup>
                  <Combobox.ClearTrigger />
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>
              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content>
                    <Combobox.Empty>No players found</Combobox.Empty>
                    {collection.items.map((item) => (
                      <Combobox.Item key={item.value} item={item}>
                        {item.label}
                        <Combobox.ItemIndicator />
                      </Combobox.Item>
                    ))}
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>
            </Combobox.Root>
          ) : (
            <Input
              size="sm"
              placeholder="New Player Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          )}

          <IconButton
            aria-label="Save player"
            variant="outline"
            borderWidth={2}
            size="sm"
            loading={loading}
            onClick={handleSave}
            colorPalette="green"
          >
            <FaCheck />
          </IconButton>

          <IconButton
            aria-label="Cancel edit"
            variant="outline"
            borderWidth={2}
            size="sm"
            onClick={handleCancel}
            colorPalette="red"
          >
            <IoCloseSharp />
          </IconButton>
        </>
      ) : (
        <IconButton
          aria-label="Add player"
          variant="outline"
          borderWidth={2}
          size="sm"
          px={2}
          colorPalette="green"
          onClick={() => setIsAdding(true)}
        >
          Add Player <MdOutlinePersonAddAlt />
        </IconButton>
      )}
    </HStack>
  );
}

export default AddPlayer;