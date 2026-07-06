import { HStack, Span, Text } from "@chakra-ui/react";
import { MdOutlinePlaylistAddCheck } from "react-icons/md";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

import type { Tourney } from "../types/Tourney";
import type { Round, RoundStatus } from "../types/Round";
import { RiProgress5Fill } from "react-icons/ri";

interface StatusElementProps {
  element: Tourney | Round;
}

// 1. Centralized configuration mapping status to color, labels, and icons
const getStatusConfig = (status: RoundStatus | string | null | undefined) => {
  switch (status) {
    case 'Complete':    return { color: "green.600",  icon: <IoIosCheckmarkCircleOutline />, label: "Complete" };
    case 'In Progress': return { color: "green.600",    icon: <RiProgress5Fill />, label: "Live" };
    case 'Ready':       return { color: "teal.400",   icon: <MdOutlinePlaylistAddCheck />, label: "Draft Complete" };
    case 'Pick Ban':    return { color: "gray.200", icon: <MdOutlinePlaylistAddCheck />, label: "Draft Phase" };
    default:            return { color: "gray.500",   icon: "○", label: status ?? 'Not Started' };
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