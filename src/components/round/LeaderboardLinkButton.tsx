import { HStack, IconButton } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { MdOutlineLeaderboard } from "react-icons/md";

import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { leaderboardPath } from "../../helpers/paths";

interface LeaderboardLinkButtonProps {
  tourneyId: number;
  roundId: number;
}

export default function LeaderboardLinkButton({ tourneyId, roundId }: LeaderboardLinkButtonProps) {
  const { tourney } = useCurrentTourney();

  return (
    <HStack>
      <RouterLink to={leaderboardPath(tourneyId, roundId, tourney?.event_id)}>
        <IconButton variant="outline" colorPalette="cyan" borderWidth="2px" size="sm" px={2}>
          Leaderboard: <MdOutlineLeaderboard />
        </IconButton>
      </RouterLink>
    </HStack>
  );
}
