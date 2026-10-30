import { Box, HStack, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { roundPath } from "../../../helpers/paths";
import { StatusElement } from "../../StatusElement";

import type { BracketMatch } from "../../../helpers/buildBracketPhases";

interface MatchCardProps {
  match: BracketMatch;
  isLosers?: boolean;
}

function playersText(match: BracketMatch): string {
  const names = match.players.map((pr) => pr.player_tourneys?.player_name ?? "Unknown");
  if (names.length === 0) return "";
  if (names.length === 1) {
    return match.round.status === "Complete" ? `${names[0]} (Bye)` : `${names[0]} vs. ??`;
  }
  return names.join(" vs. ");
}

export default function MatchCard({ match, isLosers = false }: MatchCardProps) {
  const { tourney } = useCurrentTourney();
  const navigate = useNavigate();
  const { round } = match;
  const roundUrl = roundPath(round.tourney_id, round.id, tourney?.event_id);
  const players = playersText(match);
  // red.fg/red.muted match the trash/delete icon buttons used elsewhere
  // (colorPalette="red" variant="outline") for site-wide consistency.
  const accentColor = isLosers ? "red.fg" : "cyan.solid";
  const accentMuted = isLosers ? "red.muted" : "cyan.muted";

  // Only a real 1v1 gets the split background treatment — a Bye or an
  // empty match has no "two sides" to show.
  const player1Img = match.players[0]?.player_tourneys?.player_img;
  const player2Img = match.players[1]?.player_tourneys?.player_img;
  const showSplitBackground = match.players.length === 2 && (player1Img || player2Img);

  return (
    <LinkBox
      as="article"
      position="relative"
      overflow="hidden"
      minH="140px"
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="bg.panel"
      boxShadow="sm"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: accentMuted,
      }}
    >
      {showSplitBackground && (
        <>
          {player1Img && (
            <Box
              position="absolute"
              top={0}
              bottom={0}
              left={0}
              right="50%"
              backgroundImage={`url(${player1Img})`}
              backgroundSize="cover"
              // "top" rather than "center": with these cards being much
              // wider than tall, "cover" crops down to a thin horizontal
              // sliver through whatever's at the image's vertical center —
              // often a shirt or wall, not a face. Biasing toward the top
              // (where a headshot's face usually is) at least gives this a
              // fighting chance of showing something recognizable.
              backgroundPosition="top center"
              opacity={0.5}
            />
          )}
          {player2Img && (
            <Box
              position="absolute"
              top={0}
              bottom={0}
              left="50%"
              right={0}
              backgroundImage={`url(${player2Img})`}
              backgroundSize="cover"
              backgroundPosition="top center"
              opacity={0.5}
            />
          )}
          {/* Blurs whatever's behind it (the seam between the two player
              images) so the split reads as a smooth blend, not a hard edge. */}
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left="50%"
            w="10%"
            style={{ transform: "translateX(-50%)", backdropFilter: "blur(5px)" }}
          />
          {/* Scrim so the text below stays legible over whatever the photos
              look like — the images themselves still render at the
              requested 50% opacity, this just sits above them. */}
          <Box position="absolute" inset={0} bg="blackAlpha.500" />
        </>
      )}

      <Box position="relative" h="100%" display="flex" flexDirection="column" justifyContent="center">
        <HStack justifyContent="space-between" align="center" mb={2} gap={4}>
          <Text fontWeight="bold" fontSize="md" minWidth={0} flex={1} textAlign="left">
            <LinkOverlay
              onClick={(e) => {
                e.preventDefault();
                navigate(roundUrl);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              href={roundUrl}
              color="fg"
              _hover={{ color: accentColor }}
            >
              Match {match.matchIndex}
            </LinkOverlay>
          </Text>

          <Box flexShrink={0}>
            <StatusElement element={round} shorten={true} />
          </Box>
        </HStack>

        {players ? (
          <Text fontSize="sm" fontWeight="semibold">
            {players}
          </Text>
        ) : (
          <Text fontSize="xs" color="fg.subtle" fontStyle="italic">
            No players assigned yet
          </Text>
        )}

        {match.advanceToPhaseName && (
          <Text fontSize="xs" color="fg.muted" mt={2}>
            Advance to {match.advanceToPhaseName}
          </Text>
        )}
      </Box>
    </LinkBox>
  );
}
