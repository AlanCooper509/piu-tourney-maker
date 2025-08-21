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
import StageRow from './StageRow';

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
      {!loading && !error && sortedStages.length ? (
        sortedStages.map(stage => (
          <StageRow
            key={stage.id}
            stage={stage}
            round={round}
            admin={admin}
            loadingAdmin={loadingAdmin}
            setStages={setStages}
            onRollChart={onRollChart}
            onAddChartToPool={onAddChartToPool}
          />
        ))
      ) : (
        !loading && !error && <Text mt={2}>(No stages found)</Text>
      )}
    </Box>
  );
}
