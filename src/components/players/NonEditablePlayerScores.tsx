import { Text, HStack, Tag } from '@chakra-ui/react';

import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';

import type { Stage } from '../../types/Stage';
import type { Score } from '../../types/Score';
import type { Chart } from '../../types/Chart';
import type { PlayerRound } from '../../types/PlayerRound';

interface ScoreMappingEntry {
  stage: Stage;
  score: Score | null;
  chart: Chart | null;
};

interface NonEditablePlayerScores {
  player: PlayerRound;
  stages: Stage[] | null;
};

export default function ({player, stages}: NonEditablePlayerScores) {
  // store input values keyed by stage ID
  const scoreMapping = getScoresForPlayer(player, stages);
  console.log(stages);

  return (
    stages?.map((stage) => {
      const chartName = stage.charts ? stage.charts.name_en ?? "No Name" : "No chart selected";
      const chartType = stage.charts ? stage.charts.type?.charAt(0) ?? "" : '';
      const chartLevel = stage.charts ? stage.charts.level ?? "" : '';

      const scoreEntry = scoreMapping?.find((fs: ScoreMappingEntry) =>
        fs.chart?.name_en === stage.charts?.name_en
      );
      const score = scoreEntry?.score?.score;
      return (
        <HStack key={stage.id}>
          <Tag.Root colorPalette={chartType === "D" ? "green" : chartType === "S" ? "red" : chartType === "C" ? "yellow" : "blue"}>
            <Tag.Label>{chartLevel}</Tag.Label>
          </Tag.Root>
          <Text w="5xl" truncate>{chartName}</Text>
          <Text>{score !== undefined && score !== null ? score.toLocaleString() : ''}</Text>
        </HStack>
      )
    })
  );
}