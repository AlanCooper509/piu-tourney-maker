import { HStack, IconButton } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { MdOutlineLeaderboard } from "react-icons/md";

interface LeaderboardLinkButtonProps {
  tourneyId: number;
  roundId: number;
}

export default function LeaderboardLinkButton({ tourneyId, roundId }: LeaderboardLinkButtonProps) {
  return (
    <HStack>
      <RouterLink to={`/tourney/${tourneyId}/round/${roundId}/leaderboard`}>
        <IconButton variant="outline" colorPalette="cyan" borderWidth="2px" size="sm" px={2}>
          Leaderboard: <MdOutlineLeaderboard />
        </IconButton>
      </RouterLink>
    </HStack>
  );
}
