import { HStack, Input, IconButton, Box } from "@chakra-ui/react";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

import { toaster } from "../ui/toaster";
import RoundLink from "./RoundLink";

interface EditableRoundNameProps {
  roundId: number;
  tourneyId: number;
  roundName: string;
  onRename: (newName: string) => Promise<void>;
  isLoading?: boolean;
}

export default function EditableRoundName({
  roundId,
  tourneyId,
  roundName,
  onRename,
  isLoading = false
}: EditableRoundNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(roundName);

  const handleSave = async () => {
    try {
      await onRename(newName);
      setIsEditing(false);
      toaster.create({
        title: "Round Renamed",
        description: `Round name updated to "${newName}"`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      console.error(err);
      toaster.create({
        title: "Failed to rename round",
        description: err.message || "An error occurred",
        type: "error",
        closable: true,
      });
    }
  };

  const handleCancel = () => {
    setNewName(roundName);
    setIsEditing(false);
  };

  return (
    <HStack>
      {isEditing ? (
        <>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            size="sm"
            autoFocus
          />
          <IconButton
            aria-label="Save round name"
            onClick={handleSave}
            loading={isLoading}
            size="sm"
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
        <>
          <Box fontWeight="bold">
            <RoundLink
              tourneyId={tourneyId}
              roundId={roundId}
              roundName={roundName}
            />
          </Box>
          <IconButton
            aria-label="Edit round name"
            onClick={() => setIsEditing(true)}
            size="sm"
            colorPalette="blue"
          >
            <CiEdit />
          </IconButton>
        </>
      )}
    </HStack>
  );
}