import { Box, Heading, Text, HStack, VStack, Center } from '@chakra-ui/react';

import { toaster } from '../ui/toaster';
import { handleAssignRandomChartToStage, assignPoolEntryToStage } from '../../handlers/handleAssignChartToStage';
import { handleAddChartToPool } from '../../handlers/handleAddChartToPool';
import { useCurrentTourney } from '../../context/CurrentTourneyContext';
import { useIsAdminForTourney } from '../../context/admin/AdminTourneyContext';
import AddStageButton from './AddStageButton';
import StageRow from './StageRow';
import { getStageChart } from '../../helpers/getStageChart';
import { smxChartQueryToSnapshotParams } from '../../helpers/chartSnapshot';

import type { Round } from '../../types/Round';
import type { Stage } from '../../types/Stage';
import type { ChartQuery } from '../../types/ChartQuery';

interface StageListProps {
  round: Round | null;
  stages: Stage[];
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  loading: boolean;
  error: Error | null;
}

export function StagesList({ round, stages, setStages, loading, error }: StageListProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney( tourney?.id ?? undefined );

  async function onChooseChart(stageId: number, poolId: number) {
    const pool = stages.find(s => s.id === stageId)?.chart_pools?.find(p => p.id === poolId);
    if (!pool) return;

    const updatedStage = await assignPoolEntryToStage(stageId, pool);
    if (!updatedStage) return;

    setStages(prevStages =>
      prevStages.map(stage =>
        stage.id === stageId
          ? {
              ...stage,        // keep charts, pools, scores
              ...updatedStage  // overwrite changed columns (chart_id / snapshot columns)
            }
          : stage
      )
    );

    toaster.create({
      title: "Chart Selected",
      description: `Chart "${getStageChart(updatedStage)?.name_en ?? "?"}" was selected successfully for Stage: "${stageId}".`,
      type: "success",
      closable: true,
    });
  }

  async function onRollChart(stageId: number) {
    const updatedStage = await handleAssignRandomChartToStage(stageId);
    if (!updatedStage) return;

    setStages((prevStages) =>
      prevStages.map((stage) => (stage.id === stageId ? updatedStage : stage))
    );

    toaster.create({
      title: "Chart Rolled",
      description: `Chart "${getStageChart(updatedStage)?.name_en ?? "?"}" was rolled successfully for Stage: "${stageId}".`,
      type: "success",
      closable: true,
    });
  }

  async function onAddChartToPool(stageId: number, chartQuery: ChartQuery) {
    try {
      const insertedPool = await handleAddChartToPool(
        stageId,
        chartQuery.kind === "piu"
          ? { source: "db", name: chartQuery.name, level: chartQuery.level, type: chartQuery.type }
          : smxChartQueryToSnapshotParams(chartQuery)
      );

      setStages(prevStages =>
        prevStages?.map(stage =>
          stage.id === stageId
            ? {
              ...stage,
              chart_pools: stage.chart_pools
                ? [...stage.chart_pools, insertedPool]
                : [insertedPool],
            }
            : stage
        ) || []
      );

      toaster.create({
        title: "Chart Added",
        description: `Chart "${chartQuery.name}" was added successfully to Stage ${stageId}.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      console.error("Error adding chart to pool:", err.message);
      toaster.create({
        title: "Error Adding Chart",
        description: err.message,
        type: "error",
        closable: true,
      });
    }
  }

  const sortedStages = stages?.slice().sort((a, b) => a.id - b.id) ?? [];
  return (
    <Box w={"md"}>
      <HStack mb={2} justifyContent="center" alignItems="center">
        <Heading mb={2}>Stages</Heading>
        {/* Add Stage Button */}
        {!loadingTourneyAdminStatus && isTourneyAdmin &&
          <AddStageButton round={round} setStages={setStages} />
        }
      </HStack>
      {loading && <Text>Loading stages...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      <VStack align={{ base: "center", md: "center", lg: "start" }} justify="center" gap={0}>
        {!loading && !error && sortedStages.length ? (
          sortedStages.map(stage => (
            <StageRow
            key={stage.id}
            stage={stage}
            round={round}
            setStages={setStages}
            onChooseChart={onChooseChart}
            onRollChart={onRollChart}
            onAddChartToPool={onAddChartToPool}
            />
          ))
        ) : (
          !loading && !error && (
            <Center w="100%" mt={2}>
              <Text>No stages yet.</Text>
            </Center>
          )
        )}
      </VStack>
    </Box>
  );
}
