import { useState } from "react";
import { HStack, Input, IconButton } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { IoAddCircleSharp } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";

interface AddPlayerProps {
  onAdd: (name: string) => Promise<void>;
  loading?: boolean;
}

function AddPlayer({ onAdd, loading }: AddPlayerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

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
    <HStack align="center" justify="center" mt={4}>
      {isAdding ? (
        <>
          <Input
            size="sm"
            placeholder="New Player Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <IconButton
            aria-label="Save player"
            size="sm"
            loading={loading}
            onClick={handleSave}
            colorPalette="green"
          >
            <FaCheck />
          </IconButton>
          <IconButton
            aria-label="Cancel edit"
            onClick={handleCancel}
            size="sm"
            colorPalette="red"
          >
          <IoCloseSharp />
        </IconButton>
        </>
      ) : (
        <IconButton
          aria-label="Add player"
          size="sm"
          colorPalette="green"
          onClick={() => setIsAdding(true)}
        >
            <IoAddCircleSharp />
        </IconButton>
      )}
    </HStack>
  );
}

export default AddPlayer;