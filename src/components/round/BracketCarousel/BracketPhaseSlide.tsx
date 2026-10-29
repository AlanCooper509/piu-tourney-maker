import { Box, Button, Heading, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import MatchCard from "./MatchCard";
import { isLosersPhase } from "../../../helpers/buildBracketPhases";

import type { BracketMatch, BracketPhase } from "../../../helpers/buildBracketPhases";

interface BracketPhaseSlideProps {
  phase: BracketPhase;
  onSwitchToPool: (poolId: number) => void;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  canGoPrevPhase: boolean;
  canGoNextPhase: boolean;
}

/** Clusters consecutive matches that feed into the same next-round match
 * (e.g. WR1:M1 and WR1:M2 both advancing into WR2:M1) so they can be
 * rendered with tighter spacing than unrelated matches, making the
 * bracket's convergence visually obvious. */
function groupMatchesByDestination(matches: BracketMatch[]): BracketMatch[][] {
  const groups: BracketMatch[][] = [];
  for (const match of matches) {
    const prevGroup = groups[groups.length - 1];
    const prevMatch = prevGroup?.[prevGroup.length - 1];
    const sharesDestination =
      match.advanceToRoundId != null && prevMatch?.advanceToRoundId === match.advanceToRoundId;

    if (sharesDestination) prevGroup.push(match);
    else groups.push([match]);
  }
  return groups;
}

export default function BracketPhaseSlide({
  phase,
  onSwitchToPool,
  onPrevPhase,
  onNextPhase,
  canGoPrevPhase,
  canGoNextPhase,
}: BracketPhaseSlideProps) {
  const isLosers = isLosersPhase(phase);
  // Red specifically matches the trash/delete icon buttons used elsewhere
  // (e.g. DeletablePlayerRow, DeleteRulesetDialog: colorPalette="red"
  // variant="outline") for consistency with the rest of the site — their
  // outline variant resolves to color: red.fg / borderColor: red.muted
  // (per Chakra's button recipe), not red.solid, so those are the literal
  // tokens used here too rather than a different red shade.
  const accentColor = isLosers ? "red.fg" : "cyan.solid";
  // The switch button goes TO the other side, so it's colored to match that
  // side's own styling: cyan.solid for Winners (the literal heading text
  // color), or the same red.fg/red.muted trash-icon pair for Losers. The
  // matching `colorPalette` is still set below (alongside these explicit
  // color/borderColor overrides) purely so the button keeps the same
  // colorPalette.subtle hover-background highlight every other outline
  // button on the page gets from Chakra's button recipe.
  const switchColor = isLosers ? "cyan.solid" : "red.fg";
  const switchBorderColor = isLosers ? "cyan.solid" : "red.muted";
  const matchGroups = groupMatchesByDestination(phase.matches);

  return (
    <Box px={4} py={2}>
      <HStack justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        {/* Phase (not match) navigation — same swipe-or-click pattern as
            the round prev/next buttons elsewhere, just pinned to the
            outermost edges of this row instead of overlaying the carousel,
            so they stay at a fixed, predictable spot regardless of how
            tall the match list below grows. */}
        <IconButton
          aria-label="Previous phase"
          size="sm"
          variant="outline"
          colorPalette="blue"
          flexShrink={0}
          visibility={canGoPrevPhase ? "visible" : "hidden"}
          onClick={onPrevPhase}
        >
          <IoChevronBack />
        </IconButton>

        <HStack flex="1" justifyContent="space-between" alignItems="center" gap={4} minW={0}>
          <Heading size="md" letterSpacing="tight" color={accentColor}>
            {phase.pool.name.toUpperCase()}
          </Heading>

          {phase.switchTargetPoolId != null && phase.switchLabel && (
            <Button
              size="sm"
              variant="outline"
              colorPalette={isLosers ? "cyan" : "red"}
              color={switchColor}
              borderColor={switchBorderColor}
              flexShrink={0}
              onClick={() => onSwitchToPool(phase.switchTargetPoolId!)}
            >
              Switch to {phase.switchLabel}
            </Button>
          )}
        </HStack>

        <IconButton
          aria-label="Next phase"
          size="sm"
          variant="outline"
          colorPalette="blue"
          flexShrink={0}
          visibility={canGoNextPhase ? "visible" : "hidden"}
          onClick={onNextPhase}
        >
          <IoChevronForward />
        </IconButton>
      </HStack>

      {phase.matches.length === 0 ? (
        <Text color="fg.muted" fontStyle="italic">
          No matches in this phase yet.
        </Text>
      ) : (
        <Stack gap={6}>
          {matchGroups.map((group) => (
            <Stack key={group[0].round.id} gap={1}>
              {group.map((match) => (
                <MatchCard key={match.round.id} match={match} isLosers={isLosers} />
              ))}
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}
