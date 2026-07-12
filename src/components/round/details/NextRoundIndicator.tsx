import { Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import type { Round } from "../../../types/Round";

interface NextRoundIndicatorProps {
  label: string;
  tourneyId: number;
  nextRound: Round;
}

export function NextRoundIndicator({ 
  label,
  tourneyId, 
  nextRound
}: NextRoundIndicatorProps) {
  if (!nextRound) return null;

  const navigate = useNavigate();

  return (
    <Stack
      direction={{ base: "column", sm: "row" }} 
      align="center" 
      justify="center"
      gap={0}
      mb={2}
    >
      <Text textAlign="center">
        {label}:
      </Text>
      <Text
        color="cyan.solid"
        cursor="pointer"
        fontWeight="bold"
        ml={{ base: 0, sm: 1 }}
        textAlign="center"
        onClick={() => navigate(`/tourney/${tourneyId}/round/${nextRound.id}`)}
      >
        {nextRound.name}
      </Text>
    </Stack>
  );
}