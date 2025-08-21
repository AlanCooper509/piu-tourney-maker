import { useState } from "react";
import { HStack, Input, IconButton } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";

interface AddPlayerProps {
  onAdd: (name: string) => Promise<any>;
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
    <HStack align="center" justify="center">
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
            Add Player<MdOutlinePersonAddAlt />
        </IconButton>
      )}
    </HStack>
  );
}

export default AddPlayer;