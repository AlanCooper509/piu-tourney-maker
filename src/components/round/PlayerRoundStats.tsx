import { Box, Checkbox, Collapsible, HStack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoChevronForward } from 'react-icons/io5';

import EditablePlayerScores from '../players/EditablePlayerScores';

import type { PlayerRound } from "../../types/PlayerRound";
import type { Stage } from '../../types/Stage';
import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';
import NonEditablePlayerScores from '../players/NonEditablePlayerScores';

interface PlayerRoundStatsProps {
  player: PlayerRound;
  stages: Stage[] | null;
  admin: boolean;
}

export default function PlayerRoundStats({ player, stages, admin }: PlayerRoundStatsProps) {
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
    <Box w="full">
      <Collapsible.Root
        textAlign="left"
        backgroundColor={isOpen ? "gray.800" : "transparent"}
        borderRadius="lg"
        p={isOpen ? 2 : 0}
        mb={isOpen ? '2' : '0'}
      >
        <Collapsible.Trigger onClick={toggleOpen} mb={isOpen ? 2 : 0} cursor="pointer" w="full">
          <HStack>
            <IoChevronForward
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
              }}
            />
            {admin && stagesPlayed == stages?.length ? <Checkbox.Root readOnly checked={true} variant="outline" colorPalette="green"><Checkbox.Control /></Checkbox.Root> : <></>}
            <Text fontWeight={isOpen ? "bold" : "normal"}>
              {player.player_tourneys.player_name}
            </Text>
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