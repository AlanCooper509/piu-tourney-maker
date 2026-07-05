import { Center, Text, IconButton, Box } from "@chakra-ui/react";
import { Tooltip } from "../ui/tooltip";
import { MdOutlinePersonRemoveAlt1 } from "react-icons/md";
import "@fontsource/exo-2/400.css";
import "@fontsource/exo-2/700.css"; // Bold
import "@fontsource/exo-2/900.css"; // Black (Extra bold)

import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";

import type { PlayerRound } from "../../types/PlayerRound";

interface PlayerRoundNameProps {
  playerRound: PlayerRound | null;
  color: string | null;
  onDelete?: () => void;
}

export function PlayerRoundName({ playerRound, color, onDelete }: PlayerRoundNameProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

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
      position="relative"
      className="group"
      _hover={playerRound ? {
        transform: `skewX(-${skew}deg) scale(1.03)`,
        borderColor: color || "border.strong",
        boxShadow: color?.includes("red") 
          ? "0 0 15px -3px var(--chakra-colors-red-500/30)" 
          : "0 0 15px -3px var(--chakra-colors-blue-500/30)"
      } : {}}
    >
      {playerRound && playerName ? (
        <>
          <Tooltip content={playerName}>
            <Text 
              fontFamily="'Exo 2', sans-serif"
              fontWeight="bold"
              letterSpacing="wide"
              fontSize={playerName.length > 16 ? "xl" : playerName.length > 12 ? "2xl" : "3xl"}
              color="white"
              truncate
              transform={`skewX(${skew}deg)`}
            >
              {playerName}
            </Text>
          </Tooltip>

          {/* Admin Control: delete action */}
          {!loadingTourneyAdminStatus && isTourneyAdmin && onDelete && (
            <Box
              position="absolute"
              top="1"
              right="2"
              transform={`skewX(${skew}deg)`}
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.15s ease-in-out"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              zIndex={10}
            >
              <IconButton
                aria-label="Delete player"
                variant="outline"
                colorPalette="red"
                size="xs"
                transform={`skewX(-${skew}deg)`}
                cursor="pointer"
              >
                <Box transform={`skewX(${skew}deg)`} display="inline-flex" alignItems="center" justifyContent="center">
                  <MdOutlinePersonRemoveAlt1 />
                </Box>
              </IconButton>
            </Box>
          )}
        </>
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