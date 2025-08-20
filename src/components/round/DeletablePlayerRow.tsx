import { HStack } from '@chakra-ui/react';

import PlayerRoundStats from './PlayerRoundStats';
import { handleDeletePlayerFromRound } from '../../handlers/handleDeletePlayerFromRound';
import { toaster } from '../ui/toaster';

import type { PlayerRound } from '../../types/PlayerRound';
import type { Stage } from '../../types/Stage';

interface DeletablePlayerRowProps {
  player: PlayerRound;
  stages: Stage[] | null;
  admin: boolean;
  removePlayer: (playerId: number) => void;
}

export default function DeletablePlayerRow({ player, stages, admin, removePlayer }: DeletablePlayerRowProps) {
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
    <HStack justify={admin ? "space-between" : "center"}>
        <PlayerRoundStats player={player} stages={stages} admin={admin} handleDeletePlayer={handleDeletePlayer} />
    </HStack>
  );
}
