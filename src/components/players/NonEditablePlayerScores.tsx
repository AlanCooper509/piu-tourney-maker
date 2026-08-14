import { Text, HStack, Tag, Span } from '@chakra-ui/react';

import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';

import type { Stage } from '../../types/Stage';
import type { Score } from '../../types/Score';
import type { Chart } from '../../types/Chart';
import type { PlayerRound } from '../../types/PlayerRound';
import type { Round } from '../../types/Round';
import type { CalculatedPlayerStats } from '../round/PlayersList';

interface ScoreMappingEntry {
  stage: Stage;
  score: Score | null;
  chart: Chart | null;
}

interface NonEditablePlayerScoresProps {
  player: PlayerRound;
  stages: Stage[] | null;
  round?: Round | null;
  stats?: CalculatedPlayerStats;
}

export default function NonEditablePlayerScores({ player, stages, round, stats }: NonEditablePlayerScoresProps) {
  const scoreMapping = getScoresForPlayer(player, stages);

  return (
    stages?.map((stage) => {
      const chartName = stage.charts ? stage.charts.name_en ?? "No Name" : <Span fontStyle="italic" color="fg.subtle">awaiting chart selection...</Span>;
      const chartType = stage.charts ? stage.charts.type?.charAt(0) ?? "" : '';
      const chartLevel = stage.charts ? stage.charts.level ?? "" : '??';

      const scoreEntry = scoreMapping?.find((fs: ScoreMappingEntry) =>
        fs.chart?.name_en === stage.charts?.name_en
      );
      const score = scoreEntry?.score?.score;

      // Extract points for this stage if score exists and points_per_stage is active
      const stagePoints = (score !== undefined && score !== null && round?.points_per_stage)
        ? stats?.stagePointsMap.get(stage.id)
        : undefined;

      return (
        <HStack key={stage.id} my={1} w="full" overflow="hidden" justify="space-between" gap={2}>
          <Tag.Root
            flexShrink={0}
            colorPalette={chartType === "D" ? "green" : chartType === "S" ? "red" : chartType === "C" ? "yellow" : "blue"}
          >
            <Tag.Label>{chartLevel}</Tag.Label>
          </Tag.Root>

          <Text flex="1" minW={0} truncate fontSize="sm">
            {chartName}
          </Text>

          <HStack flexShrink={0} gap={2} fontSize="sm">
            {/* Raw EX/Score */}
            <Text fontWeight="medium">
              {score !== undefined && score !== null ? score.toLocaleString() : ''}
            </Text>

            {/* Stage Points */}
            {stagePoints !== undefined && (
              <Text color="gray.400" fontSize="xs">
                ({stagePoints} pts)
              </Text>
            )}
          </HStack>
        </HStack>
      );
    })
  );
}