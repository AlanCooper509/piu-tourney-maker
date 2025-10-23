import { Box, VStack } from "@chakra-ui/react";
import type { Round } from "../../../types/Round";
import RoundNavButton from "./RoundNavButton";

type RoundsSidebarProps = {
  tourneyId: number;
  rounds: Round[];
  currentRound: Round | null;
};

export default function RoundsSidebar({
  tourneyId,
  rounds,
  currentRound,
}: RoundsSidebarProps) {
  if (!rounds) return null;
  if (!currentRound) return null;

  const filteredRounds: Round[] = [];
  const childRounds: Round[] = [];

  for (const round of rounds) {
    if (round.parent_round_id === null) {
      filteredRounds.push(round);
    } else {
      childRounds.push(round);
    }
  }

  const parentRoundId = currentRound?.parent_round_id ?? null;

  return (
    <nav style={{ padding: "1rem" }}>
      <VStack align="stretch">
        {filteredRounds.map((filteredRound) => {
          const children = childRounds.filter(
            (child) => child.parent_round_id === filteredRound.id
          );
          const isRelatedRound =
            currentRound.id === filteredRound.id || parentRoundId === filteredRound.id;

          return (
            <Box
              key={filteredRound.id}
              flex="1"
              width="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <RoundNavButton
                href={`/tourney/${tourneyId}/round/${filteredRound.id}`}
                round={filteredRound}
                isFocus={filteredRound.id === currentRound.id}
                isFamily={isRelatedRound}
              />

              {isRelatedRound && children.length > 0 && (
                <VStack mt={2}>
                  {children.map((child) => (
                    <RoundNavButton
                      key={child.id}
                      href={`/tourney/${tourneyId}/round/${child.id}`}
                      round={child}
                      isFocus={child.id === currentRound.id}
                      isFamily={isRelatedRound}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          );
        })}
      </VStack>
    </nav>
  );
}
