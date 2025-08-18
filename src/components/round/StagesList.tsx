import { Box, Heading, Text, Button, IconButton, HStack } from '@chakra-ui/react';

import { handleAssignRandomChartToStage } from '../../handlers/handleAssignRandomChartToStage';
import { handleDeleteChartFromPool } from '../../handlers/handleDeleteChartFromPool';
import { toaster } from '../ui/toaster';

import type { Stage } from '../../types/Stage';
import { handleAddChartToPool } from '../../handlers/handleAddChartToPool';
import { FaTrash } from 'react-icons/fa';
import AddChartForm from '../charts/AddChartForm';

interface StageListProps {
  stages: Stage[];
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  loading: boolean;
  error: Error | null;
  admin: boolean;
  loadingAdmin: boolean;
}

export function StagesList({ stages, setStages, loading, error, admin, loadingAdmin }: StageListProps) {
  const adminText = (
    <>
      {loadingAdmin && <Text>Loading admin status...</Text>}
      {admin ?
        <Text>(You are an admin for this tournament, you can add/modify stages)</Text> :
        <Text>(You are not an admin for this tournament, you cannot add/modify stages)</Text>
      }
    </>
  );

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

  async function onDeleteChartFromPool(stageId: number, chartId: number) {
    try {
      await handleDeleteChartFromPool(stageId, chartId);
      setStages(prevStages =>
        prevStages?.map(stage =>
          stage.id === stageId
            ? {
                ...stage,
                chart_pools: stage.chart_pools?.filter(pool => pool.chart_id !== chartId) || [],
              }
            : stage
        ) || []
      );

      toaster.create({
        title: "Chart Removed",
        description: `Chart ID "${chartId}" was removed successfully from Stage ${stageId}.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      console.error("Error deleting chart from pool:", err.message);
      toaster.create({
        title: "Error Removing Chart",
        description: err.message,
        type: "error",
        closable: true,
      });
    }
  }

  const sortedStages = stages?.slice().sort((a, b) => a.id - b.id) ?? [];
  return (
    <Box>
      <Heading mb={2}>Stages</Heading>
      {loading && <Text>Loading stages...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {adminText}
      {!loading && !error && sortedStages?.length ? (
        sortedStages.map((stage) => { 
          return (
            <Box key={stage.id} mb={2} borderWidth="1px" borderRadius="md" p={2}>
              <Text fontWeight="bold">
                (ID: {stage.id}) Chart ID: {stage.chart_id ?? 'Not Selected Yet'}
              </Text>

              {/* Roll Chart Button */}
              {!loadingAdmin && admin && !stage.chart_id && (
                <Button
                  my={2}
                  colorPalette="blue"
                  onClick={() => onRollChart(stage.id)}
                >
                  Roll the Chart
                </Button>
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
              {(stage.chart_pools?.length ? stage.chart_pools : [{ id: 0, charts: null }]).map(pool => (
                <Box key={pool.id} mb={2} borderWidth="1px" borderRadius="sm" p={2}>
                  {pool.charts ? (
                    <HStack>
                      <Text>
                        (Chart ID: {pool.charts.id}) {pool.charts.name_en ?? 'No Chart Name'} — {pool.charts.type ?? 'No Chart Type'} {pool.charts.level ?? '(No Chart Difficulty)'}
                      </Text>
                      {!loadingAdmin && admin && (
                        <IconButton
                          aria-label="Delete Chart from Pool"
                          size="sm"
                          colorPalette="red"
                          onClick={() => onDeleteChartFromPool(stage.id, pool.charts!.id)}
                        >
                          <FaTrash />
                        </IconButton>
                      )}
                    </HStack>
                  ) : (
                    <Text>No Chart in this pool yet</Text>
                  )}
                </Box>
              ))}
            </Box>
          );
        })
      ) : (
        !loading && !error && <Text>No stages found.</Text>
      )}
    </Box>
  );
}