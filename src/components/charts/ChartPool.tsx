import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import type { Stage } from "../../types/Stage";
import { FaTrash } from "react-icons/fa";
import { MdOutlineCheck } from "react-icons/md";
import { toaster } from "../ui/toaster";
import { useIsAdminForTourney } from '../../context/admin/AdminTourneyContext';
import { useCurrentTourney } from "../../context/CurrentTourneyContext";

import { handleDeleteChartFromPool } from "../../handlers/handleDeleteChartFromPool";
import { getPoolChart } from "../../helpers/getPoolChart";
import { getStageChart } from "../../helpers/getStageChart";
import { ChartRow } from "./ChartRow";

import type { ChartPool as ChartPoolRow } from "../../types/ChartPool";

interface ChartPoolProps {
  stage: Stage;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  onChooseChart: (stageId: number, poolId: number) => Promise<void>;
}

export default function ChartPool({ stage, setStages, onChooseChart }: ChartPoolProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney( tourney?.id ?? undefined );

  async function onDeleteChartFromPool(stageId: number, poolId: number) {
    try {
      await handleDeleteChartFromPool(poolId);
      setStages(prevStages =>
        prevStages?.map(stage =>
          stage.id === stageId
            ? {
              ...stage,
              chart_pools: stage.chart_pools?.filter(pool => pool.id !== poolId) || [],
            }
            : stage
        ) || []
      );

      toaster.create({
        title: "Chart Removed",
        description: `Chart was removed successfully from Stage ${stageId}.`,
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

  const pools: Pick<ChartPoolRow, "id" | "charts" | "chart_name" | "chart_type" | "chart_level" | "chart_image_url" | "created_at">[] =
    stage.chart_pools?.length ? stage.chart_pools : [{ id: 0, charts: null, created_at: stage.created_at }];

  const stageChart = getStageChart(stage);

  return pools.map(chartInPool => {
      const chart = getPoolChart(chartInPool);
      return (
      <Box mb={1} key={chartInPool.id} borderWidth={1} borderRadius="sm">
        {chart ? (
          <HStack width="100%" align="center">
            <ChartRow chart={chart} />
            {!loadingTourneyAdminStatus && isTourneyAdmin && (
              <>
                <IconButton
                  aria-label="Delete Chart from Pool"
                  size="xl"
                  variant="outline"
                  borderWidth={2}
                  colorPalette="red"
                  px={2}
                  onClick={() => onDeleteChartFromPool(stage.id, chartInPool.id)}
                >
                  <FaTrash />
                </IconButton>
                {!stageChart && stage.chart_pools && stage.chart_pools.length !== 0 && (
                  <IconButton
                    aria-label="Select Chart from Pool"
                    size="xl"
                    variant="outline"
                    borderWidth={2}
                    colorPalette="green"
                    px={2}
                    mr={2}
                    onClick={async () => {
                      await onChooseChart(stage.id, chartInPool.id);
                    }}
                  >
                    <MdOutlineCheck />
                  </IconButton>
                )}
              </>
            )}
          </HStack>
        ) : (
          <Text>(No charts in this pool yet)</Text>
        )}
      </Box>
      );
    }
    );
}
