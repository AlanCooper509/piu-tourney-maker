import { Box, Collapsible, Text, Input, IconButton, HStack } from '@chakra-ui/react';
import { IoMdSend } from "react-icons/io";
import { useState } from 'react';

import type { PlayerRound } from "../../types/PlayerRound";
import type { Stage } from '../../types/Stage';

interface PlayerRoundStatsProps {
  player: PlayerRound;
  stages: Stage[] | null;
  admin: boolean;
}

export default function PlayerRoundStats({ player, stages, admin }: PlayerRoundStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(prev => !prev);

  // store input values keyed by stage ID
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const handleChange = (stageId: number, value: string) => {
    setInputValues(prev => ({ ...prev, [stageId]: value }));
  };

  const handleSubmit = (stageId: number) => {
    const value = inputValues[stageId]?.trim();
    if (!value) return;

    // TODO: write handler for this
    console.log(`Submitting ${player.player_tourneys.player_name}'s score for stage ${stageId}: ${value}`);

    // reset this stage input
    setInputValues(prev => ({ ...prev, [stageId]: "" }));
  };

  return (
    <Box w="full">
      <Collapsible.Root
        textAlign="left"
        backgroundColor={isOpen ? "gray.700" : "transparent"}
        borderRadius="lg"
        p={isOpen ? 2 : 0}
      >
        <Collapsible.Trigger onClick={toggleOpen} mb={isOpen ? 2 : 0} cursor="pointer">
          <Text fontWeight={isOpen ? "bold" : "normal"}>
            {player.player_tourneys.player_name}
          </Text>
        </Collapsible.Trigger>

        <Collapsible.Content w="xs">
          {admin ? (
            stages?.map((stage) => {
              // TODO: write logic and queries for handling if score already exists (to edit or just to view more generally)
              const chartPlaceholder = stage.charts
                ? `${stage.charts.name_en ?? "No Name"} ${stage.charts.type?.charAt(0) ?? ""}${stage.charts.level ?? ""}`
                : "No chart selected";

              return (
                <HStack key={stage.id}>
                  <Input
                    placeholder={chartPlaceholder}
                    borderColor="white"
                    size="xs"
                    value={inputValues[stage.id] ?? ""}
                    onChange={(e) => handleChange(stage.id, e.target.value)}
                  />
                  <IconButton
                    colorPalette="green"
                    size="sm"
                    onClick={() => handleSubmit(stage.id)}
                  >
                    <IoMdSend />
                  </IconButton>
                </HStack>
              );
            })
          ) : (
            // TODO: write logic and queries for handling if score already exists (to view more generally)
            <Text>Non-admin view</Text>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}