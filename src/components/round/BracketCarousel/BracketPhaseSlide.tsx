import { Box, Stack, Text } from "@chakra-ui/react";

import MatchCard from "./MatchCard";

import type { BracketMatch, BracketPhase } from "../../../helpers/buildBracketPhases";

interface BracketPhaseSlideProps {
  phase: BracketPhase;
  onJumpToMatch: (roundId: number) => void;
  highlightedRoundId: number | null;
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
  onJumpToMatch,
  highlightedRoundId,
}: BracketPhaseSlideProps) {
  const { isLosers } = phase;
  const matchGroups = groupMatchesByDestination(phase.matches);

  return (
    // no side padding: match cards line up with the control card above
    <Box py={2}>
      {phase.matches.length === 0 ? (
        <Text color="fg.muted" fontStyle="italic">
          No matches in this phase yet.
        </Text>
      ) : (
        <Stack gap={6}>
          {matchGroups.map((group) => (
            <Stack key={group[0].round.id} gap={1}>
              {group.map((match) => (
                <MatchCard
                  key={match.round.id}
                  match={match}
                  isLosers={isLosers}
                  onJumpToMatch={onJumpToMatch}
                  highlighted={highlightedRoundId === match.round.id}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}
