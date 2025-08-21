import { Box, Heading, Text, HStack, Span, Separator, Button, Link, Collapsible } from '@chakra-ui/react';
import { IoArrowForward, IoChevronForward } from 'react-icons/io5';
import { useState } from 'react';

import { handleAssignRandomChartToStage } from '../../handlers/handleAssignRandomChartToStage';
import { handleAddChartToPool } from '../../handlers/handleAddChartToPool';
import AddChartForm from '../charts/AddChartForm';
import AddStageButton from '../stages/AddStageButton';
import { RollChartButton } from '../stages/RollChartButton';
import ChartPool from '../charts/ChartPool';
import DeleteStageButton from '../stages/DeleteStageButton';
import { ChartRow } from '../charts/ChartRow';
import { toaster } from '../ui/toaster';

import type { Round } from '../../types/Round';
import type { Stage } from '../../types/Stage';
import type { ChartQuery } from '../../types/ChartQuery';

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
    <Box maxWidth="100vw">
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
          const [isOpen, setIsOpen] = useState(!stage.charts);
          const toggleOpen = () => setIsOpen(prev => !prev);
          return (
            <>
              <Box key={stage.id} mb={2} p={2} borderWidth="2px" borderRadius="md" borderColor="gray.400">
                <Collapsible.Root defaultOpen={!stage.chart_id}>
                  <Collapsible.Trigger onClick={toggleOpen} cursor="pointer" w="full">
                      {/* Stage Header */}
                      <Text w="full" fontWeight="bold" textAlign="start">
                        <HStack>
                          <IoChevronForward
                            style={{
                              transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                          Chosen: {!stage.charts && <Span fontWeight="normal">???</Span>}
                        </HStack>
                      </Text>
                      {stage.charts && (
                        <Box mt={1}>
                          <ChartRow chart={stage.charts} />
                        </Box>
                      )}

                    {/* Admin Buttons */}
                    {!loadingAdmin && admin &&
                      <HStack alignContent={"center"} justify={"center"} mt={2}>
                        {/* Delete Stage Button */}
                        <DeleteStageButton round={round} stageId={stage.id} setStages={setStages} />

                        {/* Roll Chart Button */}
                        {!stage.chart_id && stage.chart_pools && stage.chart_pools.length !== 0 && (
                          <RollChartButton stageId={stage.id} onClick={onRollChart} />
                        )}

                        {/* Play Animation Button */}
                        {stage.chart_id && stage.chart_pools && stage.chart_pools.length !== 0 && stage.charts && (
                          <Button
                          asChild
                          variant="surface"
                          borderWidth="2"
                          size="sm"
                          px={2}
                          mx={1}
                          colorPalette="purple"
                          >
                            <Link
                              href={`/tourney/${round?.tourney_id}/round/${round?.id}/stage/${stage.id}/roll`}
                              color={"purple.fg"}
                              >
                              Open Animation <IoArrowForward />
                            </Link>
                          </Button>
                        )}
                      </HStack>
                    }
                  </Collapsible.Trigger>
                  <Collapsible.Content>
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
                    <Text fontSize="md" my={2} fontWeight={"bold"}>
                      Chart Pool
                    </Text>
                    <ChartPool
                      stage={stage}
                      setStages={setStages}
                      admin={admin}
                      loadingAdmin={loadingAdmin}
                    />
                </Collapsible.Content>
              </Collapsible.Root>
              </Box>
              <Separator mb={4}/>
            </>

          );
        })
      ) : (
        !loading && !error && <Text mt={2}>(No stages found)</Text>
      )}
    </Box>
  );
}
