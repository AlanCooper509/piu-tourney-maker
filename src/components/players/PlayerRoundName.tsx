import { Center, Text } from "@chakra-ui/react";
import { Tooltip } from "../ui/tooltip";

import type { PlayerRound } from "../../types/PlayerRound";

interface PlayerRoundNameProps {
  playerRound: PlayerRound | null;
  color: string | null;
}

export function PlayerRoundName({ playerRound, color }: PlayerRoundNameProps) {
  const playerName = playerRound?.player_tourneys?.player_name;
  const skew = 20;

  const containerBg = playerRound && color 
    ? (color.includes("red") ? "red.950/20" : "blue.950/20") 
    : "bg.muted/20";

  const containerBorder = playerRound && color 
    ? (color.includes("red") ? "red.600/40" : "blue.600/40") 
    : "border.muted";

  return (
    <Center
      maxW="xs"
      w="calc(100% + 20px)"
      h="14"
      px={8}
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={containerBorder}
      bg={containerBg}
      transform={`skewX(-${skew}deg)`}
      transition="all 0.2s ease-in-out"
      _hover={playerRound ? {
        transform: `skewX(-${skew}deg) scale(1.03)`,
        borderColor: color || "border.strong",
        boxShadow: color?.includes("red") 
          ? "0 0 15px -3px var(--chakra-colors-red-500/30)" 
          : "0 0 15px -3px var(--chakra-colors-blue-500/30)"
      } : {}}
    >
      {playerRound && playerName ? (
        <Tooltip content={playerName}>
          <Text 
            fontWeight="bold"
            letterSpacing="wider"
            fontSize="3xl"
            color="white"
            truncate
            transform={`skewX(${skew}deg)`}
          >
            {playerName}
          </Text>
        </Tooltip>
      ) : (
        <Text 
          fontWeight="bold" 
          letterSpacing="wider" 
          fontSize="2xl"
          fontStyle="italic"
          color="fg.muted/40"
          transform={`skewX(${skew}deg)`}
        >
          TBD
        </Text>
      )}
    </Center>
  );
}