import { HStack, IconButton } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { MdOutlineLeaderboard } from "react-icons/md";

import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { leaderboardPath } from "../../helpers/paths";

import type { Round } from "../../types/Round";

interface LeaderboardLinkButtonProps {
  tourneyId: number;
  roundId: number;
  round?: Round | null;
  disabled?: boolean;
}

export default function LeaderboardLinkButton({ tourneyId, roundId, round, disabled = false }: LeaderboardLinkButtonProps) {
  const { tourney } = useCurrentTourney();

  const button = (
    <IconButton variant="outline" colorPalette="cyan" borderWidth="2px" size="sm" px={2} disabled={disabled}>
      Leaderboard: <MdOutlineLeaderboard />
    </IconButton>
  );

  return (
    <HStack>
      {disabled ? button : (
        <RouterLink to={leaderboardPath(tourneyId, roundId, tourney?.event_id)} state={{ round }}>
          {button}
        </RouterLink>
      )}
    </HStack>
  );
}
