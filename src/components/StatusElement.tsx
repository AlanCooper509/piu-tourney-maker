import { HStack, Text } from "@chakra-ui/react";
import { LiveIndicator } from "./ui/LiveIndicator";

import type { Tourney } from "../types/Tourney";
import type { Round } from "../types/Round";

interface StatusElementProps {
  element: Tourney | Round;
}

export function StatusElement({ element }: StatusElementProps) {
  return (
    <HStack style={{ gap: '0px' }}>
      <Text mr={2}>Status: {element.status}</Text>
      {element.status === 'In Progress' && <LiveIndicator />}
    </HStack>
  )
}