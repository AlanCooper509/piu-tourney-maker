import { useMemo, useState } from "react";
import {
  Button,
  Container,
  HStack,
  Separator,
  Span,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BroadcastLabel } from "./BroadcastLabel";
import { handleStopBroadcast } from "../../handlers/heats/handleStopBroadcast";

import TourneyHeaderText from "../tourney/TourneyHeader/TourneyHeaderText";
import { StreamRoundRow } from "./StreamRoundRow";
import { StreamSourcesPanel } from "./StreamSourcesPanel";

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
  roundIdOverride: string | null;
}

export function StreamHelperContainer({
  tourney,
  sortedRounds,
  roundPools,
  setRounds,
  playerRounds,
  roundIdOverride,
}: StreamHelperContainerProps) {
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
  const liveRound = sortedRounds.find((r) => Number(r.id) === Number(streamRoundId)) ?? null;
  const [stopping, setStopping] = useState(false);

  async function stopBroadcast() {
    if (!tourney) return;
    setStopping(true);
    await handleStopBroadcast(tourney.id, streamRoundId);
    setStopping(false);
  }
  // Double Elimination is all 1v1 matches, so start rounds at head-to-head heats.
  const defaultHeatCapacity = tourney?.type === "Double Elimination" ? 2 : 4;

  return (
    <Container maxW="container.md" pt={8} pb={10}>
      <TourneyHeaderText
        rounds={sortedRounds}
        setRounds={setRounds}
        currentRoundId={NaN}
        roundPools={roundPools}
      />

      <Separator mt={2} mb={4} />

      {/* Broadcast is the day-of view, so it opens first; OBS Setup is the
          one-time source wiring and styling. */}
      <Tabs.Root defaultValue="broadcast" variant="enclosed" fitted>
        <Tabs.List mb={4}>
          <Tabs.Trigger value="broadcast">Broadcast</Tabs.Trigger>
          <Tabs.Trigger value="setup">OBS Setup</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="broadcast">
          {/* Same shape as RoundDetails: a "Label | value" status line, then a
              separator and the admin action centered underneath. */}
          <VStack gap={0} mb={6}>
            <HStack gap={3} align="center" wrap="wrap" justify="center">
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Broadcasting
              </Text>
              <Span w="1px" h="12px" bg="gray.700" />
              {liveRound ? (
                <Span color="red.400" fontSize="sm" fontWeight="semibold" letterSpacing="wide">
                  {liveRound.name}
                  {liveRound.active_stream_state?.heat != null &&
                    ` · Heat ${liveRound.active_stream_state.heat}`}
                </Span>
              ) : (
                <Span color="gray.500" fontSize="sm" fontWeight="semibold" letterSpacing="wide">
                  Nothing live (OBS sources show placeholders)
                </Span>
              )}
            </HStack>

            {liveRound && (
              <>
                <Separator mt={3} w="100%" />
                <HStack mt={4}>
                  <Button
                    variant="outline"
                    borderWidth={2}
                    size="sm"
                    colorPalette="red"
                    onClick={stopBroadcast}
                    loading={stopping}
                  >
                    Stop Broadcast
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
          <Text fontSize="sm" color="whiteAlpha.700" mb={4}>
            After player positions on the cabs are known, you can add them to their "lanes" and select an option next to
            [ <BroadcastLabel fontWeight="semibold" /> ] on the top right of a round's heat to stream it.
            The OBS sources will follow whatever is live. (Stream Assets can support up to 4 players per heat. There can be multiple heats per round, and the stream can switch between them.)
          </Text>

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
                  defaultHeatCapacity={defaultHeatCapacity}
                />
              ))
            )}
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="setup">
          <StreamSourcesPanel tourney={tourney} roundIdOverride={roundIdOverride} />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}