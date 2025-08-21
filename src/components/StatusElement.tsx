import { HStack, Span, Text } from "@chakra-ui/react";
import { LiveIndicator } from "./ui/LiveIndicator";

import type { Tourney } from "../types/Tourney";
import type { Round } from "../types/Round";

interface StatusElementProps {
  element: Tourney | Round;
}

export function StatusElement({ element }: StatusElementProps) {
  return (
    <HStack style={{ gap: '0px' }}>
      <Text>Status: <Span color={element.status === 'Complete' ? "green" : "gray"}>{element.status}</Span></Text>
      {element.status === 'In Progress' && <Span ml={1}><LiveIndicator /></Span>}
    </HStack>
  )
}