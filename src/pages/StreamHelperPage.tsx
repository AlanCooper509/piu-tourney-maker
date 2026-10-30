import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, Center, Text } from "@chakra-ui/react";

import { useIsAdminForTourney } from "../context/admin/AdminTourneyContext";
import { useCurrentTourney } from "../context/CurrentTourneyContext";
import { useRoundStreamData } from "../hooks/useRoundStreamData";
import { useSyncEventForTourney } from "../hooks/useSyncEventForTourney";
import { StreamHelperContainer } from "../components/stream/StreamHelperContainer";
import { TourneyHeroBanner } from "../components/tourney/TourneyHeader/TourneyHeroBanner";
import { Toaster } from "../components/ui/toaster";

export function StreamHelperPage() {
  const { tourneyId, eventId: urlEventId } = useParams();
  const [searchParams] = useSearchParams();
  const roundIdOverride = searchParams.get("roundId");

  const streamData = useRoundStreamData(
    tourneyId ?? "",
    roundIdOverride,
    "stream-helper",
  );

  // the URL's event (if any) shows immediately; the loaded tourney's own event wins if they differ
  useSyncEventForTourney(
    streamData.tourney?.event_id ?? (urlEventId ? Number(urlEventId) : undefined),
  );

  // The header breadcrumb names the tourney from CurrentTourneyContext.
  const { tourney: contextTourney, setTourney } = useCurrentTourney();
  // banner uses the tourney already in context (e.g. coming from TourneyPage) until this page's own fetch lands
  const bannerTourney = streamData.tourney
    ?? (contextTourney && String(contextTourney.id) === tourneyId ? contextTourney : null);
  useEffect(() => {
    if (streamData.tourney) setTourney(streamData.tourney);
  }, [streamData.tourney, setTourney]);

  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    streamData.tourney?.id ?? undefined,
  );

  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  // Wait for the tourney too: before it loads there's no id to check, which
  // reads as "not an admin" and flashes the denial on every page load.
  if (streamData.tourney && !loadingTourneyAdminStatus && !isTourneyAdmin) {
    return (
      <Center h="60vh">
        <Text fontSize="xl" color="red.400">
          You must be a tournament admin to view Stream Helper.
        </Text>
      </Center>
    );
  }

  return (
    <Box mt={4}>
      <TourneyHeroBanner tourney={bannerTourney} />
      <StreamHelperContainer
        tourney={streamData.tourney}
        sortedRounds={streamData.sortedRounds}
        roundPools={streamData.roundPools}
        setRounds={streamData.setRounds}
        playerRounds={streamData.playerRounds}
        roundIdOverride={roundIdOverride}
      />
      <Toaster />
    </Box>
  );
}

export default StreamHelperPage;
