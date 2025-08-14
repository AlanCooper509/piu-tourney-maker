import { HStack, Text, Input, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { FaCheck } from 'react-icons/fa';
import { FaTrash } from "react-icons/fa";
import { IoCloseSharp } from 'react-icons/io5';

import { handleRenamePlayerInTourney } from '../../handlers/handleRenamePlayerInTourney';
import { toaster } from '../../components/ui/toaster';
import type { PlayerTourney } from '../../types/PlayerTourney';
import type { Tourney } from '../../types/Tourney';
import { handleDeletePlayerFromTourney } from '../../handlers/handlerDeletePlayerFromTourney';

interface EditablePlayerRowProps {
  player: PlayerTourney;
  admin: boolean;
  updatePlayer: (updated: PlayerTourney) => void;
  removePlayer: (playerId: number) => void;
}

export default function EditablePlayerRow({ player, admin, updatePlayer, removePlayer }: EditablePlayerRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(player.player_name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedPlayer = await handleRenamePlayerInTourney(player.id, newName);
      updatePlayer(updatedPlayer);
      setIsEditing(false);
      toaster.create({
        title: 'Player Renamed',
        description: `Player ${player.player_name} updated to "${updatedPlayer.player_name}"`,
        type: 'success',
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: 'Failed to rename player',
        description: err.message,
        type: 'error',
        closable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!confirm(`Delete player "${player.player_name}"?`)) return;
    try {
      await handleDeletePlayerFromTourney(player.id);
      removePlayer(player.id);
      toaster.create({
        title: "Player deleted",
        description: `"${player.player_name}" was removed.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to delete player",
        description: err.message,
        type: "error",
        closable: true,
      });
    }
  }

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(player.player_name);
  };

  return (
    <HStack justify="center" width="100%">
      {isEditing ? (
        <>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            size="sm"
            autoFocus
            width="auto"
          />
          <IconButton
            aria-label="Save name"
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
          <Text>{player.player_name}</Text>
          {admin && (
            <>
              <IconButton
                aria-label="Edit player name"
                size="sm"
                colorPalette="blue"
                onClick={() => setIsEditing(true)}
              >
                <CiEdit />
              </IconButton>
              <IconButton
                aria-label="Delete player"
                size="sm"
                colorPalette="red"
                onClick={handleDeletePlayer}
              >
                <FaTrash />
              </IconButton>
            </>
          )}
        </>
      )}
    </HStack>
  );
}
