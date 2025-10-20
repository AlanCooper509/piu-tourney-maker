import { Box, Button, Link, VStack } from "@chakra-ui/react";
import type { Round } from "../../types/Round";

type RoundsSidebarProps = {
  tourneyId: number;
  rounds: Round[];
  currRound: string;
};

export default function RoundsSidebar({
  tourneyId,
  rounds,
  currRound,
}: RoundsSidebarProps) {
  if (!rounds) return null;

  const filteredRounds: Round[] = [];
  const childRounds: Round[] = [];

  for (const round of rounds) {
    if (round.parent_round_id === null) {
      filteredRounds.push(round);
    } else {
      childRounds.push(round);
    }
  }

  const currentRound = rounds.find((r) => String(r.id) === String(currRound));
  const parentRoundId = currentRound?.parent_round_id ?? null;

  return (
    <nav style={{ padding: "1rem" }}>
      <VStack align="stretch">
        {filteredRounds.map((round) => {
          const children = childRounds.filter(
            (child) => child.parent_round_id === round.id
          );
          const shouldShowChildren =
            currRound === String(round.id) || parentRoundId === round.id;

          return (
            <Box
              key={round.id}
              flex="1"
              width="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Link
                display="flex"
                justifyContent="center"
                href={`/tourney/${tourneyId}/round/${round.id}`}
              >
                <Button
                  size="sm"
                  colorPalette="blue"
                  variant="outline"
                  width="180px"
                  whiteSpace="normal"
                  wordBreak="break-word"
                  textAlign="center"
                  py={"18px"}
                  fontWeight={
                    currRound === String(round.id) ? "bold" : "normal"
                  }
                  textDecoration={
                    currRound === String(round.id) ? "underline" : "none"
                  }
                  mb={children.length > 0 ? 1 : 0}
                >
                  {round.name}
                </Button>
              </Link>

              {shouldShowChildren && children.length > 0 && (
                <VStack mt={2}>
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      display="flex"
                      justifyContent="center"
                      href={`/tourney/${tourneyId}/round/${child.id}`}
                    >
                      <Button
                        size="sm"
                        bg="#151519"
                        colorPalette="blue"
                        variant="outline"
                        width="180px"
                        whiteSpace="normal"
                        wordBreak="break-word"
                        textAlign="center"
                        py={"24px"}
                        fontWeight={
                          currRound === String(child.id) ? "bold" : "normal"
                        }
                        textDecoration={
                          currRound === String(child.id) ? "underline" : "none"
                        }
                      >
                        {child.name}
                      </Button>
                    </Link>
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
