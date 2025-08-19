import { Box, HStack, IconButton, Spacer, Text } from "@chakra-ui/react";
import type { Stage } from "../../types/Stage";
import { FaTrash } from "react-icons/fa";
import { toaster } from "../ui/toaster";

import { handleDeleteChartFromPool } from "../../handlers/handleDeleteChartFromPool";

interface ChartPoolProps {
  stage: Stage;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  admin: boolean;
  loadingAdmin: boolean;
}

export default function ChartPool({ stage, setStages, admin, loadingAdmin }: ChartPoolProps) {
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
  
  return (
    stage.chart_pools?.length ? stage.chart_pools : [{ id: 0, charts: null }]).map(chartInPool => (
      <Box key={chartInPool.id} borderWidth="1px" borderRadius="sm" pl={4}>
        {chartInPool.charts ? (
          <HStack mb={2} width="100%" align="center">
              <Text>
                {chartInPool.charts.name_en ?? 'No Chart Name'}
              </Text>
              <Spacer />
              <Text>
                {chartInPool.charts.type ?? 'No Chart Type'} {chartInPool.charts.level ?? '(No Chart Difficulty)'}
              </Text>
              {!loadingAdmin && admin && (
                <IconButton
                aria-label="Delete Chart from Pool"
                size="sm"
                colorPalette="red"
                px={2}
                onClick={() => onDeleteChartFromPool(stage.id, chartInPool.charts!.id)}
                >
                  Remove Chart<FaTrash />
                </IconButton>
              )}
          </HStack>
        ) : (
          <Text>(No charts in this pool yet)</Text>
        )}
      </Box>
    )
    );
}