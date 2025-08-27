import { Box, Checkbox, Collapsible, HStack, IconButton, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';

import EditablePlayerScores from '../players/EditablePlayerScores';

import type { PlayerRound } from "../../types/PlayerRound";
import type { Stage } from '../../types/Stage';
import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';
import NonEditablePlayerScores from '../players/NonEditablePlayerScores';

interface PlayerRoundStatsProps {
  player: PlayerRound;
  stages: Stage[] | null;
  admin: boolean;
  handleDeletePlayer: React.MouseEventHandler<HTMLButtonElement>;
}

export default function PlayerRoundStats({ player, stages, admin, handleDeletePlayer }: PlayerRoundStatsProps) {
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
        backgroundColor={isOpen ? "gray.900" : "transparent"}
        borderRadius="lg"
        py={isOpen ? 2 : 0}
        px={isOpen ? 4 : 0}
        mb={isOpen ? 2 : 0}
        borderColor="border.emphasized"
        borderWidth={isOpen ? 1 : 0}
      >
        <Collapsible.Trigger asChild onClick={toggleOpen} mb={isOpen ? 2 : 0} cursor="pointer" w="full">
          <HStack w="full" align="center" justify="space-between">
            <IoChevronForward
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
              }}
            />
            <HStack flex="1" overflow="hidden">
              {admin && stagesPlayed == stages?.length && (
                <Checkbox.Root readOnly checked variant="outline" colorPalette="green">
                  <Checkbox.Control />
                </Checkbox.Root>
              )}
              <Text
                fontWeight={isOpen ? "bold" : "normal"}
                truncate
                title={player.player_tourneys.player_name}
              >
                {player.player_tourneys.player_name}
              </Text>
            </HStack>
            {admin && (
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
        <Collapsible.Content w="xs">
          {admin ? 
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