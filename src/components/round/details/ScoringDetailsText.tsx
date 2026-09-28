import { Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface ScoringDetailsTextProps {
  pointsPerStage?: string | null;
  tourneyId?: number;
  carryOverRoundId?: number | null;
  carryOverRoundName?: string | null;
}

export default function ScoringDetailsText({ pointsPerStage, tourneyId, carryOverRoundId, carryOverRoundName }: ScoringDetailsTextProps) {
  const pointsArray = pointsPerStage ? pointsPerStage.split(',').map(pointValue => pointValue.trim()) : null;
  const showDetails = pointsArray && (pointsArray.length !== 1 || pointsArray[0] !== "1");
  const pointDetails = showDetails ? ` (${pointsArray?.join(', ')})` : "";
  return (
    <>
      <Text>
        Scoring: {pointsPerStage ? `Points${pointDetails}` : "Cumulative"}
      </Text>
      {carryOverRoundName && carryOverRoundId != null && (
        <Text fontSize="sm" color="fg.muted">
          (includes scores from{" "}
          <Link
            asChild
            color="cyan.solid"
            fontWeight="bold"
            _hover={{ color: "cyan.focusRing" }}
          >
            <RouterLink to={`/tourney/${tourneyId}/round/${carryOverRoundId}`}>
              {carryOverRoundName}
            </RouterLink>
          </Link>
          )
        </Text>
      )}
    </>
  );
}