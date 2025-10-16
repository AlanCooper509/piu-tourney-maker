import { HStack, Input, IconButton, Text } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { useState } from "react";
import { toaster } from "../ui/toaster";

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
      toaster.create({
        title: 'Tourney Renamed',
        description: `Tourney name updated to "${newName}"`,
        type: 'success',
        closable: true,
      });
    } catch (err: any) {
      console.error(err);
      toaster.create({
        title: 'Failed to rename tourney',
        description: err.message || 'An error occurred',
        type: 'error',
        closable: true,
      });
    }
  };

  const handleCancel = () => {
    setNewName(tourneyName);
    setIsEditing(false);
  };

  return (
    <HStack mb={4}>
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
            variant="outline"
            borderWidth={2}
            size="sm"
            colorPalette="green"
          >
            <FaCheck />
          </IconButton>
          <IconButton
            aria-label="Cancel edit"
            onClick={handleCancel}
            variant="outline"
            borderWidth={2}
            size="sm"
            colorPalette="red"
          >
            <IoCloseSharp />
          </IconButton>
        </>
      ) : (
        <>
          <Text>{tourneyName}</Text>
          <IconButton
            aria-label="Edit name"
            colorPalette="blue"
            onClick={() => setIsEditing(true)}
            variant="outline"
            borderWidth={2}
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