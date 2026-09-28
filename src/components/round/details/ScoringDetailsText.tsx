import { Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { roundPath } from "../../../helpers/paths";

interface ScoringDetailsTextProps {
  pointsPerStage?: string | null;
  tourneyId?: number;
  carryOverRoundId?: number | null;
  carryOverRoundName?: string | null;
}

export default function ScoringDetailsText({ pointsPerStage, tourneyId, carryOverRoundId, carryOverRoundName }: ScoringDetailsTextProps) {
  const { tourney } = useCurrentTourney();
  const pointsArray = pointsPerStage ? pointsPerStage.split(',').map(pointValue => pointValue.trim()) : null;
  const showDetails = pointsArray && (pointsArray.length !== 1 || pointsArray[0] !== "1");
  const pointDetails = showDetails ? ` (${pointsArray?.join(', ')})` : "";
  return (
    <>
      <Text color="fg.muted">
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
            <RouterLink to={roundPath(tourneyId ?? "", carryOverRoundId, tourney?.event_id)}>
              {carryOverRoundName}
            </RouterLink>
          </Link>
          )
        </Text>
      )}
    </>
  );
}