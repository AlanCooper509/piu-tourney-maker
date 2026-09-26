import { useEffect, useState } from "react";
import { Box, Button, Collapsible, Text, HStack, Link, Separator, Span } from "@chakra-ui/react";
import { IoArrowForward, IoChevronForward } from "react-icons/io5";

import { ChartRow } from "../charts/ChartRow";
import DeleteStageButton from "./DeleteStageButton";
import { RollChartButton } from "./RollChartButton";
import AddChartForm from "../charts/AddChartForm";
import ChartPool from "../charts/ChartPool";
import { useIsAdminForTourney } from '../../context/admin/AdminTourneyContext';
import { useCurrentTourney } from "../../context/CurrentTourneyContext";

import type { ChartQuery } from "../../types/ChartQuery";
import type { Round } from "../../types/Round";
import type { Stage } from "../../types/Stage";
import { getStageChart } from "../../helpers/getStageChart";
import { getPoolChart } from "../../helpers/getPoolChart";

interface StageRowProps {
  stage: Stage;
  round: Round | null;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  onChooseChart: (stageId: number, poolId: number) => Promise<void>;
  onRollChart: (stageId: number) => Promise<void>;
  onAddChartToPool: (stageId: number, chartQuery: ChartQuery) => Promise<void>;
}

export default function StageRow({ stage, round, setStages, onChooseChart, onRollChart, onAddChartToPool }: StageRowProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const stageChart = getStageChart(stage);

  const [isOpen, setIsOpen] = useState(!stageChart);

  useEffect(() => {
    setIsOpen(!getStageChart(stage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.chart_id, stage.chart_name]);

  const isAdminView = !loadingTourneyAdminStatus && isTourneyAdmin;
  const onlyPoolChart = stage.chart_pools?.length === 1 ? getPoolChart(stage.chart_pools[0]) : null;
  const singleChart = stageChart ?? onlyPoolChart;

  // a one-chart pool has nothing to reveal, so viewers just see the chart
  if (!isAdminView && stage.chart_pools?.length === 1 && singleChart) {
    return (
      <Box mb={2} w="full">
        <ChartRow chart={singleChart} />
      </Box>
    );
  }

  return (
    <Box
      key={stage.id}
      mb={2}
      p={2}
      w="full"
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.400"
    >
      <Collapsible.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
        <Collapsible.Trigger asChild>
          <Box cursor="pointer" w="full">
            {/* Stage Header */}
            <Box w="full" fontWeight="bold" textAlign="start">
              <HStack justify="space-between" w="full">
                <HStack>
                  <IoChevronForward
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  <Text>
                    Chosen: {!stageChart && <Span fontWeight="normal">???</Span>}
                  </Text>
                </HStack>

                {!loadingTourneyAdminStatus && isTourneyAdmin && (
                  <HStack gap={0}>
                    {stageChart &&
                      stage.chart_pools &&
                      stage.chart_pools.length !== 0 && (
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
                            color="purple.fg"
                          >
                            Open Animation <IoArrowForward />
                          </Link>
                        </Button>
                      )}
                    <DeleteStageButton
                      round={round}
                      stage={stage}
                      setStages={setStages}
                    />
                  </HStack>
                )}
              </HStack>
            </Box>

            {stageChart && (
              <Box mt={1}>
                <ChartRow chart={stageChart} />
              </Box>
            )}

            {/* Admin Buttons */}
            {!loadingTourneyAdminStatus && isTourneyAdmin &&
              !stageChart &&
              stage.chart_pools &&
              stage.chart_pools.length !== 0 && (
                <HStack alignContent="center" justify="center" mt={2}>
                  <RollChartButton stageId={stage.id} onClick={onRollChart} />
                </HStack>
              )}
          </Box>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <Separator size="lg" borderColor="gray.800" borderWidth="1px" mt={2} />

          {!loadingTourneyAdminStatus && isTourneyAdmin && (
            <AddChartForm
              onSubmit={(chartQuery: ChartQuery) => onAddChartToPool(stage.id, chartQuery)}
            />
          )}

          <Text fontSize="md" my={2} fontWeight="bold">
            Chart Pool
          </Text>
          <ChartPool
            stage={stage}
            setStages={setStages}
            onChooseChart={onChooseChart}
          />
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}