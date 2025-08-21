import { HStack, IconButton, Link } from "@chakra-ui/react";
import { MdOutlineLeaderboard } from "react-icons/md";

interface LeaderboardLinkButtonProps {
  tourneyId: number;
  roundId: number;
}

export default function LeaderboardLinkButton({ tourneyId, roundId }: LeaderboardLinkButtonProps) {
  return (
    <HStack>
      <Link href={`/tourney/${tourneyId}/round/${roundId}/leaderboard`}>
        <IconButton variant="outline" colorPalette="cyan" borderWidth="2px" size="sm" px={2}>
          Leaderboard: <MdOutlineLeaderboard />
        </IconButton>
      </Link>
    </HStack>
  );
}