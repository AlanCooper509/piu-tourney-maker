import { Box, Button, Grid, HStack, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Link as RouterLink } from "react-router-dom";
import { PiArrowElbowLeftUpBold } from "react-icons/pi";
import { TbTournament, TbTrendingDown } from "react-icons/tb";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { roundPath } from "../../../helpers/paths";
import { StatusElement } from "../../StatusElement";
import { Tooltip } from "../../ui/tooltip";

import type { BracketMatch, BracketMatchRef } from "../../../helpers/buildBracketPhases";

// one ring pulse when a quick-nav jump lands on a card (afterwards the card just keeps its hover look until
// the carousel clears it). Animates opacity; a border/outline width steps visibly through whole pixels
const pulseOnce = keyframes`
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
`;

// each player photo covers 60% of the card and fades out over the middle 20% (40%-60%), so the two crossfade
// instead of meeting at a hard seam; no fixed blur strip that the centered nav row could sit oddly against
const SEAM_FADE_RIGHT = "linear-gradient(to right, black 66.7%, transparent)";
const SEAM_FADE_LEFT = "linear-gradient(to left, black 66.7%, transparent)";

interface MatchCardProps {
  match: BracketMatch;
  isLosers?: boolean;
  onJumpToMatch: (roundId: number) => void;
  highlighted?: boolean; // set when a quick-nav jump lands on this card, until the next click/keypress
}

function playersText(match: BracketMatch): string {
  const names = match.players.map((pr) => pr.player_tourneys?.player_name ?? "Unknown");
  if (names.length === 0) return "";
  if (names.length === 1) {
    return match.round.status === "Complete" ? `${names[0]} (Bye)` : `${names[0]} vs. ??`;
  }
  return names.join(" vs. ");
}

interface QuickNavProps {
  target: BracketMatchRef;
  onJump: (roundId: number) => void;
  icon: React.ReactNode;
  color: string;
  description: string; // e.g. "Winner to" / "Loser from"
}

/** Small arrow button that moves the carousel to a related match, e.g. "→ M1"; full phase name in the tooltip. */
function QuickNavButton({ target, onJump, icon, color, description }: QuickNavProps) {
  const label = `${description} ${target.phaseName}, Match ${target.matchIndex}`;
  return (
    <Tooltip content={label} openDelay={300}>
      <Button size="xs" variant="ghost" color={color} px={1.5} gap={1} aria-label={label} onClick={() => onJump(target.roundId)}>
        {icon} M{target.matchIndex}
      </Button>
    </Tooltip>
  );
}

export default function MatchCard({ match, isLosers = false, onJumpToMatch, highlighted = false }: MatchCardProps) {
  const { tourney } = useCurrentTourney();
  const { round } = match;
  const roundUrl = roundPath(round.tourney_id, round.id, tourney?.event_id);
  const players = playersText(match);
  const accentColor = isLosers ? "red.400" : "cyan.solid";
  const accentMuted = isLosers ? "red.muted" : "cyan.muted";

  // Only a real 1v1 gets the split background treatment — a Bye or an
  // empty match has no "two sides" to show.
  const player1Img = match.players[0]?.player_tourneys?.player_img;
  const player2Img = match.players[1]?.player_tourneys?.player_img;
  const showSplitBackground = match.players.length === 2 && (player1Img || player2Img);

  return (
    <LinkBox
      data-round-id={round.id}
      as="article"
      position="relative"
      overflow="hidden"
      minH="140px"
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="bg.panel"
      cursor="pointer"
      transition="all 0.2s"
      // a quick-nav target holds the same look as hover until the next click/keypress
      transform={highlighted ? "translateY(-2px)" : undefined}
      boxShadow={highlighted ? "md" : "sm"}
      borderColor={highlighted ? accentMuted : undefined}
      _after={{
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        border: "2px solid",
        borderColor: isLosers ? "red.solid" : accentColor, // darker than the losers text red so the ring stands out
        opacity: 0,
        pointerEvents: "none",
        animation: highlighted ? `${pulseOnce} 1s ease-out` : undefined,
      }}
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
              right="40%"
              backgroundImage={`url(${player1Img})`}
              backgroundSize="cover"
              backgroundPosition="top center"
              opacity={0.5}
              css={{ maskImage: SEAM_FADE_RIGHT, WebkitMaskImage: SEAM_FADE_RIGHT }}
            />
          )}
          {player2Img && (
            <Box
              position="absolute"
              top={0}
              bottom={0}
              left="40%"
              right={0}
              backgroundImage={`url(${player2Img})`}
              backgroundSize="cover"
              backgroundPosition="top center"
              opacity={0.5}
              css={{ maskImage: SEAM_FADE_LEFT, WebkitMaskImage: SEAM_FADE_LEFT }}
            />
          )}
          {/* scrim keeps the text legible over the photos */}
          <Box position="absolute" inset={0} bg="blackAlpha.500" />
        </>
      )}

      <Box position="relative" h="100%" display="flex" flexDirection="column" justifyContent="center">
        <HStack justifyContent="space-between" align="center" mb={2} gap={4}>
          <Text fontWeight="bold" fontSize="md" minWidth={0} flex={1} textAlign="left">
            <LinkOverlay asChild color={accentColor}>
              <RouterLink to={roundUrl} onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                Match {match.matchIndex}
              </RouterLink>
            </LinkOverlay>
          </Text>

          <Box flexShrink={0}>
            <StatusElement element={round} shorten={true} />
          </Box>
        </HStack>

        {players ? (
          <Text fontSize="lg" fontWeight="bold" lineHeight="short">
            {players}
          </Text>
        ) : (
          <Text fontSize="xs" color="fg.subtle" fontStyle="italic">
            No players assigned yet
          </Text>
        )}

        {/* nav links sit above the card-wide LinkOverlay (zIndex) so they get their own clicks */}
        {(match.advanceToPhaseName || match.winnerTo) && (
          // equal side columns keep the text centered on the card, with the winner link on the right
          <Grid mt={1} templateColumns="1fr auto 1fr" alignItems="center" gap={0}>
            <Box />
            <Text fontSize="xs" color="fg.muted" textAlign="center">
              {match.advanceToPhaseName && `Advance to ${match.advanceToPhaseName}`}
            </Text>
            {match.winnerTo ? (
              // negative margin: the button overhangs instead of making the row taller
              <Box justifySelf="end" position="relative" zIndex={1} my={-2}>
                <QuickNavButton
                  target={match.winnerTo}
                  onJump={onJumpToMatch}
                  icon={<TbTournament />}
                  color={accentColor}
                  description="Winner to"
                />
              </Box>
            ) : <Box />}
          </Grid>
        )}

        {/* vertical moves between Winners and Losers go along the bottom */}
        {(match.loserTo || match.loserFrom.length > 0) && (
          <HStack mt={1} gap={0.5} justify="center" position="relative" zIndex={1}>
            {match.loserFrom.map((source) => (
              <QuickNavButton
                key={source.roundId}
                target={source}
                onJump={onJumpToMatch}
                icon={<PiArrowElbowLeftUpBold />}
                color="cyan.solid"
                description="Loser from"
              />
            ))}
            {match.loserTo && (
              <QuickNavButton
                target={match.loserTo}
                onJump={onJumpToMatch}
                icon={<TbTrendingDown />}
                color="red.400"
                description="Loser to"
              />
            )}
          </HStack>
        )}
      </Box>
    </LinkBox>
  );
}
