import { HStack, Text, IconButton } from '@chakra-ui/react';
import { FaTrash } from "react-icons/fa";

import { handleDeletePlayerFromRound } from '../../handlers/handleDeletePlayerFromRound';
import { toaster } from '../ui/toaster';

import type { PlayerRound } from '../../types/PlayerRound';

interface DeletablePlayerRowProps {
  player: PlayerRound;
  admin: boolean;
  removePlayer: (playerId: number) => void;
}

export default function DeletablePlayerRow({ player, admin, removePlayer }: DeletablePlayerRowProps) {
  const handleDeletePlayer = async () => {
    if (!confirm(`Delete player "${player.player_tourneys.player_name}"?`)) return;
    try {
      await handleDeletePlayerFromRound(player.id);
      removePlayer(player.id);
      toaster.create({
        title: "Player deleted",
        description: `"${player.player_tourneys.player_name}" was removed from the round.`,
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

  return (
    <HStack justify={admin ? "space-between" : "center"} width="100%">
        <Text>{player.player_tourneys.player_name}</Text>
        {admin && (
          <>
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
    </HStack>
  );
}
