import { Box, Heading, Text, HStack } from '@chakra-ui/react';

import { handleAssignRandomChartToStage } from '../../handlers/handleAssignRandomChartToStage';
import { toaster } from '../ui/toaster';

import { handleAddChartToPool } from '../../handlers/handleAddChartToPool';
import AddChartForm from '../charts/AddChartForm';
import AddStageButton from '../stages/AddStageButton';
import { RollChartButton } from '../stages/RollChartButton';

import type { Round } from '../../types/Round';
import type { Stage } from '../../types/Stage';
import ChartPool from '../charts/ChartPool';
import DeleteStageButton from '../stages/DeleteStageButton';

interface StageListProps {
  round: Round | null;
  stages: Stage[];
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  loading: boolean;
  error: Error | null;
  admin: boolean;
  loadingAdmin: boolean;
}

export function StagesList({ round, stages, setStages, loading, error, admin, loadingAdmin }: StageListProps) {
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
    <Box>
      <HStack justifyContent="center" alignItems="center">
        <Heading mb={2}>Stages</Heading>
        {/* Add Stage Button */}
        {!loadingAdmin && admin &&
          <AddStageButton round={round} setStages={setStages} />
        }
      </HStack>
      {loading && <Text>Loading stages...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {!loading && !error && sortedStages?.length ? (
        sortedStages.map((stage) => { 
          return (
            <Box key={stage.id} mb={2} borderWidth="1px" borderRadius="md" p={2}>
              <HStack justifyContent={"center"} alignItems="center">
                {/* Delete Stage Button */}
                <DeleteStageButton round={round} stageId={stage.id} setStages={setStages} />

                {/* Stage Header */}
                <Text fontWeight="bold">
                  (ID: {stage.id}) Chart ID: {stage.chart_id ?? 'Not Selected Yet'}
                </Text>
              </HStack>

              {/* Roll Chart Button */}
              {!loadingAdmin && admin && !stage.chart_id && stage.chart_pools && stage.chart_pools.length !== 0 && (
                <RollChartButton stageId={stage.id} onClick={onRollChart} />
              )}

              {/* Add Chart Form */}
              {!loadingAdmin && admin && (
                <AddChartForm
                  onSubmit={(chartQuery: { name: string; level: number; type: 'Single' | 'Double' | 'Co-Op' | 'UCS' }) =>
                    onAddChartToPool(stage.id, chartQuery.name, chartQuery.level, chartQuery.type)
                  }
                />
              )}

              {/* Charts in chart pool */}
              <ChartPool
                stage={stage}
                setStages={setStages}
                admin={admin}
                loadingAdmin={loadingAdmin}
              />
            </Box>
          );
        })
      ) : (
        !loading && !error && <Text mt={2}>(No stages found)</Text>
      )}
    </Box>
  );
}