import { Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import type { Round } from "../../../types/Round";

interface NextRoundIndicatorProps {
  label: string;
  tourneyId: number;
  nextRound: Round;
  centered?: boolean;
}

export function NextRoundIndicator({
  label,
  tourneyId,
  nextRound,
  centered = false,
}: NextRoundIndicatorProps) {
  if (!nextRound) return null;

  const navigate = useNavigate();
  const textAlign = centered ? "center" : { base: "center", sm: "left" };

  return (
    <Stack
      direction={{ base: "column", sm: "row" }}
      align={centered ? "center" : { base: "center", sm: "baseline" }}
      justify={centered ? "center" : "flex-start"}
      gap={0}
      minW={0}
      flex={centered ? undefined : 1}
    >
      <Text textAlign={textAlign} flexShrink={0}>
        {label}:
      </Text>
      <Text
        color="cyan.solid"
        cursor="pointer"
        fontWeight="bold"
        ml={{ base: 0, sm: 1 }}
        textAlign={textAlign}
        truncate={!centered}
        minW={0}
        onClick={() => navigate(`/tourney/${tourneyId}/round/${nextRound.id}`)}
      >
        {nextRound.name}
      </Text>
    </Stack>
  );
}