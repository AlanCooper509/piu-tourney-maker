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

interface StageRowProps {
  stage: Stage;
  round: Round | null;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  onChooseChart: (stageId: number, chartId: number) => Promise<void>;
  onRollChart: (stageId: number) => Promise<void>;
  onAddChartToPool: (
    stageId: number,
    name: string,
    level: number,
    type: 'Single' | 'Double' | 'Co-Op' | 'UCS'
  ) => Promise<void>;
}

export default function StageRow({ stage, round, setStages, onChooseChart, onRollChart, onAddChartToPool }: StageRowProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const [isOpen, setIsOpen] = useState(!stage.chart_id);
  const toggleOpen = () => setIsOpen(prev => !prev);

  useEffect(() => {
    setIsOpen(!stage.chart_id);
  }, [stage.chart_id]);

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
                    Chosen: {!stage.charts && <Span fontWeight="normal">???</Span>}
                  </Text>
                </HStack>

                {!loadingTourneyAdminStatus && isTourneyAdmin && (
                  <DeleteStageButton
                    round={round}
                    stageId={stage.id}
                    setStages={setStages}
                  />                  
                )}
              </HStack>
            </Box>

            {stage.charts && (
              <Box mt={1}>
                <ChartRow chart={stage.charts} />
              </Box>
            )}

            {/* Admin Buttons */}
            {!loadingTourneyAdminStatus && isTourneyAdmin && (
              <HStack alignContent="center" justify="center" mt={2}>
                {!stage.chart_id &&
                  stage.chart_pools &&
                  stage.chart_pools.length !== 0 && (
                    <RollChartButton stageId={stage.id} onClick={onRollChart} />
                  )}

                {stage.chart_id &&
                  stage.chart_pools &&
                  stage.chart_pools.length !== 0 &&
                  stage.charts && (
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
              </HStack>
            )}
          </Box>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <Separator size="lg" borderColor="gray.800" borderWidth="1px" mt={2} />

          {!loadingTourneyAdminStatus && isTourneyAdmin && (
            <AddChartForm
              onSubmit={(chartQuery: ChartQuery) =>
                onAddChartToPool(
                  stage.id,
                  chartQuery.name,
                  chartQuery.level,
                  chartQuery.type
                )
              }
            />
          )}

          <Text fontSize="md" my={2} fontWeight="bold">
            Chart Pool
          </Text>
          <ChartPool
            stage={stage}
            setStages={setStages}
            onChooseChart={onChooseChart}
            toggleOpen={toggleOpen}
          />
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}