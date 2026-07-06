import { HStack, Span, Text } from "@chakra-ui/react";
import { BsFillRecordFill } from "react-icons/bs";
import { FaPlugCircleCheck } from "react-icons/fa6";

import type { Tourney } from "../types/Tourney";
import type { Round, RoundStatus } from "../types/Round";

interface StatusElementProps {
  element: Tourney | Round;
}

// 1. Centralized configuration mapping status to color, labels, and icons
const getStatusConfig = (status: RoundStatus | string | null | undefined) => {
  switch (status) {
    case 'Complete':
      return { color: "green.500", icon: "✓", label: "Complete" };
    case 'In Progress':
      return { color: "red.500", icon: <BsFillRecordFill />, label: "Live" }; // Solid glyph
    case 'Ready':
      return { color: "blue.500", icon: <FaPlugCircleCheck />, label: "Ready" }; // Steady bullet or ready indicator glyph
    case 'Pick Ban':
      return { color: "orange.400", icon: "✦", label: "Draft Phase" }; // Spark/Star glyph for preparation
    default:
      return { color: "gray.500", icon: "○", label: status ?? 'Not Started' };
  }
};

export function StatusElement({ element }: StatusElementProps) {
  const { color, icon, label } = getStatusConfig(element.status);

  return (
    <HStack gap="3" align="center">
      <Text fontSize="sm" color="gray.500" fontWeight="medium">
        Status
      </Text>

      {/* Sleek inline vertical divider separator */}
      <Span w="1px" h="12px" bg="gray.700" />

      <HStack gap="1.5" align="center">
        {/* Typographic Icon Glyph */}
        <Span color={color} fontSize="xs" fontWeight="bold">
          {icon}
        </Span>

        {/* Status Text Display */}
        <Span color={color} fontSize="sm" fontWeight="semibold" letterSpacing="wide">
          {label}
        </Span>
      </HStack>
    </HStack>
  );
}