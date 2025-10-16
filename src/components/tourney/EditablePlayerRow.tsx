import { HStack, Text, Input, IconButton, NumberInput, Field, Box } from '@chakra-ui/react';
import { useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { FaCheck } from 'react-icons/fa';
import { IoCloseSharp } from 'react-icons/io5';
import { MdOutlinePersonRemoveAlt1 } from "react-icons/md"

import { handleDeletePlayerFromTourney } from '../../handlers/handleDeletePlayerFromTourney';
import { handleUpdatePlayerInTourney } from '../../handlers/handleUpdatePlayerInTourney';
import { toaster } from '../../components/ui/toaster';
import { useCurrentTourney } from '../../context/CurrentTourneyContext';
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";

import type { PlayerTourney } from '../../types/PlayerTourney';

interface EditablePlayerRowProps {
  player: PlayerTourney;
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

export default function EditablePlayerRow({ player, updatePlayer, removePlayer }: EditablePlayerRowProps) {
  const { tourneyId, setTourneyId: _setTourneyId } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(Number(tourneyId));

  const [isEditing, setIsEditing] = useState(false);
  const [newSeed, setNewSeed] = useState(player.seed);
  const [newName, setNewName] = useState(player.player_name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedPlayer = await handleUpdatePlayerInTourney(player.id, newName, newSeed ? newSeed : null);
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
    <HStack w="full" justify={(!loadingTourneyAdminStatus && isTourneyAdmin) ? "space-between" : "center"} align="center">
    {isEditing ? (
      <Box display="flex" alignItems="end" gap={2} backgroundColor="bg.subtle" borderColor="border.inverted" borderWidth="1px" borderRadius="md" p={2}>
        <Field.Root>
          <Field.Label>Seed</Field.Label>
          <NumberInput.Root
            size="sm"
            value={newSeed ? String(newSeed) : undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewSeed(Number(e.target.value))
            }
          >
            <NumberInput.Input maxW="5px"/>
          </NumberInput.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Player Name</Field.Label>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            size="sm"
            autoFocus
            width="auto"
          />
        </Field.Root>
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
      </Box>
    ) : (
      <>
        {/* Left side: player seed/name */}
        <HStack flex="1" overflow="hidden" mx={4}>
          <Text truncate title={player.player_name}>
            {player.seed ? `${player.player_name} (${player.seed})` : player.player_name}
          </Text>
        </HStack>

        {/* Right side: admin buttons */}
        {!loadingTourneyAdminStatus && isTourneyAdmin && (
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
