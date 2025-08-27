import { HStack, Text, Input, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { FaCheck } from 'react-icons/fa';
import { IoCloseSharp } from 'react-icons/io5';
import { MdOutlinePersonRemoveAlt1 } from "react-icons/md"

import { handleDeletePlayerFromTourney } from '../../handlers/handleDeletePlayerFromTourney';
import { handleRenamePlayerInTourney } from '../../handlers/handleRenamePlayerInTourney';
import { toaster } from '../../components/ui/toaster';

import type { PlayerTourney } from '../../types/PlayerTourney';

interface EditablePlayerRowProps {
  player: PlayerTourney;
  admin: boolean;
  updatePlayer: (updated: PlayerTourney) => void;
  removePlayer: (playerId: number) => void;
}

function alertText(playerName: string) {
  const lines = [
    `Delete player "${playerName}"?`,
    "This will remove ALL of their scores on ALL of their rounds in this tournament!!"
  ]
  return lines.join('\n')
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
    if (!confirm(alertText(player.player_name))) return;
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
    <HStack w="full" justify={admin ? "space-between" : "center"} align="center">
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
          variant="outline"
          size="sm"
          colorPalette="green"
        >
          <FaCheck />
        </IconButton>
        <IconButton
          aria-label="Cancel edit"
          onClick={handleCancel}
          variant="outline"
          size="sm"
          colorPalette="red"
        >
          <IoCloseSharp />
        </IconButton>
      </>
    ) : (
      <>
        {/* Left side: player name */}
        <HStack flex="1" overflow="hidden" mx={4}>
          <Text truncate title={player.player_name}>
            {player.player_name}
          </Text>
        </HStack>

        {/* Right side: admin buttons */}
        {admin && (
          <HStack mx={4}>
            <IconButton
              aria-label="Edit player name"
              variant="outline"
              size="sm"
              colorPalette="blue"
              onClick={() => setIsEditing(true)}
            >
              <CiEdit />
            </IconButton>
            <IconButton
              aria-label="Delete player"
              variant="outline"
              size="sm"
              colorPalette="red"
              onClick={handleDeletePlayer}
            >
              <MdOutlinePersonRemoveAlt1 />
            </IconButton>
          </HStack>
        )}
      </>
    )}
  </HStack>
  );
}
