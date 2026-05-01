import { Text } from "@chakra-ui/react";

export default function ScoringDetailsText({ pointsPerStage }: { pointsPerStage?: string | null }) {  
  const pointsArray = pointsPerStage ? pointsPerStage.split(',').map(pointValue => pointValue.trim()) : null;
  const showDetails = pointsArray && (pointsArray.length !== 1 || pointsArray[0] !== "1");
  const pointDetails = showDetails ? ` (${pointsArray?.join(', ')})` : "";
  return (
    <Text>
      Scoring: {pointsPerStage ? `Points${pointDetails}` : "Cumulative"}
    </Text>
  );
}