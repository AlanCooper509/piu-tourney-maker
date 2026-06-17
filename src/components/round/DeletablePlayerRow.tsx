import { HStack } from '@chakra-ui/react';
import { useState } from 'react';

import PlayerRoundStats from './PlayerRoundStats';
import { handleDeletePlayerFromRound } from '../../handlers/round/handleDeletePlayerFromRound';
import { toaster } from '../ui/toaster';

import type { PlayerRound } from '../../types/PlayerRound';
import type { Stage } from '../../types/Stage';

interface DeletablePlayerRowProps {
  player: PlayerRound;
  stages: Stage[] | null;
  removePlayer: (playerId: number) => void;
}

export default function DeletablePlayerRow({ player, stages, removePlayer }: DeletablePlayerRowProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePlayer = async (): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await handleDeletePlayerFromRound(player.id);
      removePlayer(player.id);
      setIsDeleteOpen(false);
      
      toaster.create({
        title: "Player deleted",
        description: `"${player.player_tourneys.player_name}" was removed from the round.`,
        type: "success",
        closable: true,
      });
      return true;
    } catch (err: any) {
      toaster.create({
        title: "Failed to delete player",
        description: err.message,
        type: "error",
        closable: true,
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <HStack justify="space-between" w="full">
      <PlayerRoundStats 
        player={player} 
        stages={stages} 
        handleDeletePlayer={handleDeletePlayer}
        isDeleting={isDeleting}
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
      />
    </HStack>
  );
}