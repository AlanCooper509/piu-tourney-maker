import { Box, Heading, Text, HStack, Span, Separator, Button } from '@chakra-ui/react';

import { handleAssignRandomChartToStage } from '../../handlers/handleAssignRandomChartToStage';
import { toaster } from '../ui/toaster';

import { handleAddChartToPool } from '../../handlers/handleAddChartToPool';
import AddChartForm from '../charts/AddChartForm';
import AddStageButton from '../stages/AddStageButton';
import { RollChartButton } from '../stages/RollChartButton';
import ChartPool from '../charts/ChartPool';
import DeleteStageButton from '../stages/DeleteStageButton';

import type { Round } from '../../types/Round';
import type { Stage } from '../../types/Stage';
import type { ChartQuery } from '../../types/ChartQuery';
import { useNavigate } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5';

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
  const navigate = useNavigate();
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

  async function onPlayAnimation(stageId: number) {
    await navigate(`/tourney/${round?.tourney_id}/round/${round?.id}/stage/${stageId}/roll`);
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
      <HStack mb={2} justifyContent="center" alignItems="center">
        <Heading>Stages</Heading>
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
            <Box key={stage.id} mb={2} p={2} background="gray.900" borderWidth="2px" borderRadius="md" borderColor="gray.800">
              <HStack justifyContent={"center"} alignItems="center">
                {/* Stage Header */}
                <Text fontWeight="bold">
                  Selected: {stage.charts?.name_en ?? <><Span fontWeight="normal">: ???</Span></>} {stage.charts?.type?.charAt(0) ?? ""}{stage.charts?.level ?? ""}
                </Text>
                {/* Delete Stage Button */}
                {!loadingAdmin && admin &&
                  <DeleteStageButton round={round} stageId={stage.id} setStages={setStages} />
                }
              </HStack>

              {/* Roll Chart Button */}
              {!loadingAdmin && admin && !stage.chart_id && stage.chart_pools && stage.chart_pools.length !== 0 && (
                <RollChartButton stageId={stage.id} onClick={onRollChart} />
              )}
              {!loadingAdmin && admin && stage.chart_id && stage.chart_pools && stage.chart_pools.length !== 0 && stage.charts && (
                <Button colorPalette="purple" onClick={() => onPlayAnimation(stage.id)}>
                  Open Animation
                  <IoArrowForward />
                </Button>
              )
              }

              <Separator size="lg" borderColor="gray.800" borderWidth="1px" mt={2} />

              {/* Add Chart Form */}
              {!loadingAdmin && admin && (
                <AddChartForm
                  onSubmit={(chartQuery: ChartQuery) =>
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
