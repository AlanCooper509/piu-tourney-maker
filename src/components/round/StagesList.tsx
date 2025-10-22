import { Box, Heading, Text, HStack } from '@chakra-ui/react';

import { handleAssignRandomChartToStage } from '../../handlers/handleAssignChartToStage';
import { handleAssignChartToStage } from '../../handlers/handleAssignChartToStage';
import { handleAddChartToPool } from '../../handlers/handleAddChartToPool';
import AddStageButton from '../stages/AddStageButton';
import { toaster } from '../ui/toaster';
import { useCurrentTourney } from '../../context/CurrentTourneyContext';
import { useIsAdminForTourney } from '../../context/admin/AdminTourneyContext';

import type { Round } from '../../types/Round';
import type { Stage } from '../../types/Stage';
import StageRow from './StageRow';

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

  async function onChooseChart(stageId: number, chosenChartId: number) {
    const updatedStage = await handleAssignChartToStage(stageId, chosenChartId,);
    if (!updatedStage) return;

    setStages((prevStages) =>
      prevStages.map((stage) => (stage.id === stageId ? updatedStage : stage))
    );

    toaster.create({
      title: "Chart Selected",
      description: `Chart ID "${updatedStage.chart_id}" was selected successfully for Stage: "${stageId}".`,
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
      description: `Chart ID "${updatedStage.chart_id}" was rolled successfully for Stage: "${stageId}".`,
      type: "success",
      closable: true,
    });
  }

  async function onAddChartToPool(
    stageId: number,
    chartName: string,
    chartLevel: number,
    chartType: 'Single' | 'Double' | 'Co-Op' | 'UCS'
  ) {
    try {
      const insertedPool = await handleAddChartToPool(stageId, {
        name: chartName,
        level: chartLevel,
        type: chartType,
      });

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
        description: `Chart "${chartName}" was added successfully to Stage ${stageId}.`,
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
    <Box maxWidth="100vw">
      <HStack mb={2} justifyContent="center" alignItems="center">
        <Heading>Stages</Heading>
        {/* Add Stage Button */}
        {!loadingTourneyAdminStatus && isTourneyAdmin &&
          <AddStageButton round={round} setStages={setStages} />
        }
      </HStack>
      {loading && <Text>Loading stages...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
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
        !loading && !error && <Text mt={2}>No stages yet.</Text>
      )}
    </Box>
  );
}
