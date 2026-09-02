import { useParams, useSearchParams } from "react-router-dom";
import { Center, Text } from "@chakra-ui/react";

import { useIsAdminForTourney } from "../context/admin/AdminTourneyContext";
import { useRoundStreamData } from "../hooks/useRoundStreamData";
import { StreamHelperContainer } from "../components/stream/StreamHelperContainer";

export function StreamHelperPage() {
  const { tourneyId } = useParams();
  const [searchParams] = useSearchParams();
  const roundIdOverride = searchParams.get("roundId");

  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  const streamData = useRoundStreamData(
    tourneyId,
    roundIdOverride,
    "stream-helper",
  );

  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    streamData.tourney?.id ?? undefined,
  );

  if (!loadingTourneyAdminStatus && !isTourneyAdmin) {
    return (
      <Center h="60vh">
        <Text fontSize="xl" color="red.400">
          You must be a tournament admin to view Stream Helper.
        </Text>
      </Center>
    );
  }

  return (
    <StreamHelperContainer
      tourney={streamData.tourney}
      sortedRounds={streamData.sortedRounds}
      roundPools={streamData.roundPools}
      setRounds={streamData.setRounds}
      playerRounds={streamData.playerRounds}
      tourneyId={tourneyId}
      roundIdOverride={roundIdOverride}
    />
  );
}

export default StreamHelperPage;