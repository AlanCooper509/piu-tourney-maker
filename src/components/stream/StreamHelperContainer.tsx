import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Flex,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";

import TourneyHeaderText from "../tourney/TourneyHeader/TourneyHeaderText";
import { StreamRoundRow } from "./StreamRoundRow";

import type { Tourney } from "../../types/Tourney";
import type { Round } from "../../types/Round";
import type { RoundPool } from "../../types/RoundPool";
import type { PlayerRound } from "../../types/PlayerRound";

interface StreamHelperContainerProps {
  tourney: Tourney | null;
  sortedRounds: Round[];
  roundPools: RoundPool[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
  playerRounds: PlayerRound[];
  tourneyId: string;
  roundIdOverride: string | null;
}

export function StreamHelperContainer({
  tourney,
  sortedRounds,
  roundPools,
  setRounds,
  playerRounds,
  tourneyId,
  roundIdOverride,
}: StreamHelperContainerProps) {
  const streamViewerPath = `/tourney/${tourneyId}/StreamViewer${
    roundIdOverride ? `?roundId=${roundIdOverride}` : ""
  }`;

  const playersByRound = useMemo(() => {
    const sorted = [...playerRounds].sort((a, b) => {
      const nameA = a.player_tourneys?.player_name ?? `Player ${a.id}`;
      const nameB = b.player_tourneys?.player_name ?? `Player ${b.id}`;

      return nameA.localeCompare(nameB, undefined, {
        sensitivity: "base",
      });
    });

    return sorted.reduce<Record<string, PlayerRound[]>>((acc, pr) => {
      const rId = String(pr.round_id);

      if (!acc[rId]) {
        acc[rId] = [];
      }

      acc[rId].push(pr);

      return acc;
    }, {});
  }, [playerRounds]);

  const streamRoundId = tourney?.stream_round_id ?? null;

  return (
    <Container maxW="container.md" pt={8} pb={10}>
      <TourneyHeaderText
        rounds={sortedRounds}
        setRounds={setRounds}
        currentRoundId={NaN}
        roundPools={roundPools}
      />

      <Separator mt={2} mb={4} />

      <Flex
        justify="space-between"
        align="center"
        mb={4}
        wrap="wrap"
        gap={2}
      >
        <Button
          asChild
          colorPalette="purple"
          variant="outline"
          borderWidth={2}
          size="sm"
        >
          <Link to={streamViewerPath}>
            Open Stream Viewer
          </Link>
        </Button>
      </Flex>

      <VStack gap={4} align="stretch" w="100%">
        {sortedRounds.length === 0 ? (
          <Text color="whiteAlpha.500" fontSize="sm">
            No rounds found for this tournament.
          </Text>
        ) : (
          sortedRounds.map((round) => (
            <StreamRoundRow
              key={round.id}
              round={round}
              players={playersByRound[String(round.id)] ?? []}
              streamRoundId={streamRoundId}
            />
          ))
        )}
      </VStack>
    </Container>
  );
}