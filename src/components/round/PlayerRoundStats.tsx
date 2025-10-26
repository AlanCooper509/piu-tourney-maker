import { Box, Checkbox, Collapsible, HStack, IconButton, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';

import EditablePlayerScores from '../players/EditablePlayerScores';
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from '../../context/CurrentTourneyContext';
import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';
import NonEditablePlayerScores from '../players/NonEditablePlayerScores';

import type { PlayerRound } from "../../types/PlayerRound";
import type { Stage } from '../../types/Stage';

interface PlayerRoundStatsProps {
  player: PlayerRound;
  stages: Stage[] | null;
  handleDeletePlayer: React.MouseEventHandler<HTMLButtonElement>;
}

export default function PlayerRoundStats({ player, stages, handleDeletePlayer }: PlayerRoundStatsProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney( tourney?.id ?? undefined );

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(prev => !prev);
  const [stagesPlayed, setStagesPlayed] = useState(0);

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
        borderWidth={ isOpen ? "1px" : "0px" }
        borderStyle="solid"
        borderColor="gray.100"
        borderRadius="4px"
        mb={ isOpen ? 2 : 0 }
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
              {!loadingTourneyAdminStatus && isTourneyAdmin && stagesPlayed == stages?.length && (
                <Checkbox.Root readOnly checked variant="outline" colorPalette="green">
                  <Checkbox.Control />
                </Checkbox.Root>
              )}
              <Text
                truncate
                title={player.player_tourneys.player_name}
              >
                {player.player_tourneys.player_name}
              </Text>
            </HStack>
            {!loadingTourneyAdminStatus && isTourneyAdmin && (
              <IconButton
                aria-label="Delete player"
                variant="outline"
                size="xs"
                colorPalette="red"
                onClick={handleDeletePlayer}
              >
                <FaTrash />
              </IconButton>
            )}
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content
          backgroundColor={isOpen ? "gray.800" : "transparent"}
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="gray.500"
          py={2}
          px={4}
        >
          {!loadingTourneyAdminStatus && isTourneyAdmin ? 
            <EditablePlayerScores
              player={player}
              stages={stages}
              incrementStagesPlayed={incrementStagesPlayed}
            /> : 
          (
            <NonEditablePlayerScores
              player={player}
              stages={stages}
            />
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}