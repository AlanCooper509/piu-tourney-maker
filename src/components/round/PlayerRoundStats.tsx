import { Box, Checkbox, Collapsible, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';

import EditablePlayerScores from '../players/EditablePlayerScores';
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from '../../context/CurrentTourneyContext';
import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';
import NonEditablePlayerScores from '../players/NonEditablePlayerScores';
import DialogForm from '../../components/ui/DialogForm';

import type { PlayerRound } from "../../types/PlayerRound";
import type { Stage } from '../../types/Stage';

interface PlayerRoundStatsProps {
  player: PlayerRound;
  stages: Stage[] | null;
  handleDeletePlayer: () => Promise<boolean>;
  isDeleting: boolean;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
}

export default function PlayerRoundStats({ 
  player, 
  stages, 
  handleDeletePlayer,
  isDeleting,
  isDeleteOpen,
  setIsDeleteOpen
}: PlayerRoundStatsProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [stagesPlayed, setStagesPlayed] = useState(0);

  const hasStages = !!stages && stages.length > 0;
  const playerName = player.player_tourneys.player_name;

  const toggleOpen = () => setIsOpen(prev => !prev);

  useEffect(() => {
    if (!stages) return;
    const entries = getScoresForPlayer(player, stages);
    const played = entries.filter(entry => entry.score !== null).length;
    setStagesPlayed(played);
  }, [player, stages]);

  function incrementStagesPlayed() {
    setStagesPlayed(prev => prev + 1);
  }

  return (
    <Box w={["xs", "md", "md", "sm"]}>
      <Collapsible.Root
        textAlign="left"
        borderWidth={isOpen ? "1px" : "0px"}
        borderStyle="solid"
        borderColor="gray.400"
        borderRadius="md"
        mb={isOpen ? 2 : 0}
      >
        <Collapsible.Trigger
          asChild
          onClick={toggleOpen}
          cursor="pointer"
          w="full"
        >
          <HStack w="full" align="center" justify="space-between" px={2} py={1}>
            <IoChevronForward
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
              }}
            />
            <HStack flex="1" overflow="hidden">
              {!loadingTourneyAdminStatus && isTourneyAdmin && stagesPlayed == stages?.length && stages.length > 0 && (
                <Checkbox.Root readOnly checked variant="outline" colorPalette="green">
                  <Checkbox.Control />
                </Checkbox.Root>
              )}
              <Text truncate title={playerName}>
                {playerName}
              </Text>
            </HStack>
            
            {!loadingTourneyAdminStatus && isTourneyAdmin && (
              <Box onClick={(e) => e.stopPropagation()}>
                <DialogForm
                  title={`Delete player "${playerName}"?`}
                  showSubmit={true}
                  isDestructive={true}
                  loading={isDeleting}
                  open={isDeleteOpen}
                  setOpen={setIsDeleteOpen}
                  onSubmit={handleDeletePlayer}
                  onCancel={async () => true}             
                  trigger={
                    <IconButton
                      aria-label="Delete player"
                      variant="outline"
                      size="xs"
                      colorPalette="red"
                    >
                      <FaTrash />
                    </IconButton>
                  }
                  formBody={
                    <VStack gap={3} py={2}>
                      <Text fontSize="sm" textAlign="center" color="fg">
                        This will remove <strong>ALL</strong> of {playerName}'s scores on <strong>this</strong> specific round!
                      </Text>
                      <Text fontSize="sm" textAlign="center" color="fg.error" fontWeight="medium">
                        Are you sure you want to proceed?
                      </Text>
                    </VStack>
                  }
                />
              </Box>
            )}
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content
          backgroundColor={isOpen ? "gray.800" : "transparent"}
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="gray.500"
          borderBottomRadius="md"
          py={2}
          px={4}
        >
          {hasStages ? (
            !loadingTourneyAdminStatus && isTourneyAdmin ? (
              <EditablePlayerScores
                player={player}
                stages={stages}
                incrementStagesPlayed={incrementStagesPlayed}
              />
            ) : (
              <NonEditablePlayerScores
                player={player}
                stages={stages}
              />
            )
          ) : (
            <Text fontSize="sm" color="gray.200" textAlign="center" py={1}>
              No stages yet.
            </Text>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}