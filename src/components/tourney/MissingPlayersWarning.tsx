import { useState } from "react";
import { Badge, Box, Card, Collapsible, HStack, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import { IoChevronForward } from "react-icons/io5";

import type { PlayerTourney } from "../../types/PlayerTourney";

interface MissingPlayersWarningProps {
  missingPlayers: PlayerTourney[];
}

export default function MissingPlayersWarning({ missingPlayers }: MissingPlayersWarningProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (missingPlayers.length === 0) return null;

  return (
    <Collapsible.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
      <Card.Root variant="outline" size="sm" borderWidth={1} borderColor="orange.700" w="md" mx="auto">
        <Card.Body>
          <Collapsible.Trigger asChild cursor="pointer" width="100%">
            <HStack justifyContent="space-between" gap={2}>
              <HStack gap={2}>
                <LuTriangleAlert size={16} color="orange" />
                <Text fontSize="sm" fontWeight="semibold">
                  {missingPlayers.length} player{missingPlayers.length !== 1 ? "s are" : " is"} not added to any round yet.
                </Text>
              </HStack>
              <IoChevronForward
                style={{
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </HStack>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <Box pt={3} px={1} width="100%">
              <HStack gap={1.5} flexWrap="wrap" justifyContent="center">
                {missingPlayers.map((player) => (
                  <Badge key={player.id} colorPalette="orange" variant="subtle" size="sm">
                    {player.player_name}
                  </Badge>
                ))}
              </HStack>
            </Box>
          </Collapsible.Content>
        </Card.Body>
      </Card.Root>
    </Collapsible.Root>
  );
}
