import { HStack, Input, IconButton, Text } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { useState } from "react";

function EditableTourneyName({
  tourneyName,
  onRename,
  isLoading = false
}: {
  tourneyName: string;
  onRename: (newName: string) => Promise<void>;
  isLoading?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(tourneyName);

  const handleSave = async () => {
    try {
      await onRename(newName);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setNewName(tourneyName);
    setIsEditing(false);
  };

  return (
    <HStack>
      <Text>
      Name: 
      </Text>
      {isEditing ? (
        <>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            size="sm"
            autoFocus
          />
          <IconButton
            aria-label="Save name"
            onClick={handleSave}
            loading={isLoading}
            size="sm"
            colorScheme="green"
          >
            <FaCheck />
          </IconButton>
          <IconButton
            aria-label="Cancel edit"
            onClick={handleCancel}
            size="sm"
          >
            <IoCloseSharp />
          </IconButton>
        </>
      ) : (
        <>
          <Text>{tourneyName}</Text>
          <IconButton
            aria-label="Edit name"
            onClick={() => setIsEditing(true)}
            size="sm"
          >
            <CiEdit />
          </IconButton>
        </>
      )}
    </HStack>
  );
}

export default EditableTourneyName;