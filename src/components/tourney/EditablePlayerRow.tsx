import { 
  HStack, 
  Text, 
  IconButton, 
  Popover, 
  Portal, 
  VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { MdOutlinePersonRemoveAlt1 } from "react-icons/md";

import { handleDeletePlayerFromTourney } from '../../handlers/handleDeletePlayerFromTourney';
import { handleUpdatePlayerInTourney } from '../../handlers/handleUpdatePlayerInTourney';
import { toaster } from '../../components/ui/toaster';
import { useCurrentTourney } from '../../context/CurrentTourneyContext';
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";

import { PlayerForm } from '../players/PlayerEntry/PlayerForm';
import DialogForm from '../../components/ui/DialogForm'; // Adjust path based on your workspace setup

import type { PlayerTourney } from '../../types/PlayerTourney';

interface EditablePlayerRowProps {
  player: PlayerTourney;
  updatePlayer: (updated: PlayerTourney) => void;
  removePlayer: (playerId: number) => void;
}

export default function EditablePlayerRow({ player, updatePlayer, removePlayer }: EditablePlayerRowProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  // Layout states for individual overlay frames
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [newSeed, setNewSeed] = useState<string>(player.seed ? String(player.seed) : "");
  const [newName, setNewName] = useState(player.player_name);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsLoading(true);
      const seedValue = newSeed.trim() !== "" ? Number(newSeed) : null;
      
      const updatedPlayer = await handleUpdatePlayerInTourney(player.id, newName.trim(), seedValue);
      updatePlayer(updatedPlayer);
      setIsOpen(false);
      
      toaster.create({
        title: 'Player Updated',
        description: `Player ${player.player_name} updated successfully.`,
        type: 'success',
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: 'Failed to update player',
        description: err.message,
        type: 'error',
        closable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async (): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await handleDeletePlayerFromTourney(player.id);
      removePlayer(player.id);
      setIsDeleteOpen(false);
      
      toaster.create({
        title: "Player deleted",
        description: `"${player.player_name}" was removed.`,
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

  const handleCancelEdit = () => {
    setIsOpen(false);
    setNewName(player.player_name);
    setNewSeed(player.seed ? String(player.seed) : "");
  };

  return (
    <HStack w="full" maxW="100%" minW="0" justify={(!loadingTourneyAdminStatus && isTourneyAdmin) ? "space-between" : "center"} align="center">
      {/* Left side: player seed/name display */}
      <HStack flex="1" minW="0" overflow="hidden" mx={4}>
        <Text truncate title={player.player_name}>
          {player.seed ? `${player.player_name} (${player.seed})` : player.player_name}
        </Text>
      </HStack>

      {/* Right side: admin action triggers */}
      {!loadingTourneyAdminStatus && isTourneyAdmin && (
        <HStack mx={4} flexShrink={0} gap={2}>
          
          {/* Edit Player Popup Container */}
          <Popover.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} positioning={{ placement: "bottom-end" }}>
            <Popover.Trigger asChild>
              <IconButton
                aria-label="Edit player name"
                variant="outline"
                size="sm"
                colorPalette="blue"
              >
                <CiEdit />
              </IconButton>
            </Popover.Trigger>

            <Portal>
              <Popover.Positioner>
                <Popover.Content p={4} w="300px" boxShadow="md">
                  <Popover.Arrow />
                  
                  <PlayerForm 
                    name={newName}
                    setName={setNewName}
                    seed={newSeed}
                    setSeed={setNewSeed}
                    onSubmit={handleSave}
                    onCancel={handleCancelEdit}
                    submitLabel="Save"
                    loading={isLoading}
                  />

                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>

          {/* Delete Player Dialog Form */}
          <DialogForm
            title={`Delete player "${player.player_name}"?`}
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
            loading={isDeleting}
            onSubmit={handleDeletePlayer}
            onCancel={async () => { return true; }}             
            showSubmit={true}
            trigger={
              <IconButton
                aria-label="Delete player"
                variant="outline"
                size="sm"
                colorPalette="red"
                loading={isDeleteOpen}
              >
                <MdOutlinePersonRemoveAlt1 />
              </IconButton>
            }
            formBody={
              <VStack gap={4}>
                <Text fontSize="sm" textAlign="center">
                  This will remove <strong>ANY AND ALL</strong> of {player.player_name}'s scores across <strong>ALL</strong> rounds within this entire tournament!
                </Text>
                <Text fontSize="sm" textAlign="center" mt={2} color="fg.error">
                  Are you sure you want to proceed?
                </Text>
              </VStack>
            }
          />

        </HStack>
      )}
    </HStack>
  );
}