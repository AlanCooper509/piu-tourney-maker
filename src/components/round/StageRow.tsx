import { useState } from "react";
import type { Round } from "../../types/Round";
import type { Stage } from "../../types/Stage";
import { Box, Button, Collapsible, Text, HStack, Link, Separator, Span } from "@chakra-ui/react";
import { IoArrowForward, IoChevronForward } from "react-icons/io5";
import { ChartRow } from "../charts/ChartRow";
import DeleteStageButton from "../stages/DeleteStageButton";
import { RollChartButton } from "../stages/RollChartButton";
import AddChartForm from "../charts/AddChartForm";
import type { ChartQuery } from "../../types/ChartQuery";
import ChartPool from "../charts/ChartPool";

export default function StageRow({
  stage,
  round,
  admin,
  loadingAdmin,
  setStages,
  onRollChart,
  onAddChartToPool,
}: {
  stage: Stage;
  round: Round | null;
  admin: boolean;
  loadingAdmin: boolean;
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  onRollChart: (stageId: number) => Promise<void>;
  onAddChartToPool: (
    stageId: number,
    name: string,
    level: number,
    type: 'Single' | 'Double' | 'Co-Op' | 'UCS'
  ) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(!stage.charts);
  const toggleOpen = () => setIsOpen(prev => !prev);

  return (
    <Box
      key={stage.id}
      mb={2}
      p={2}
      w="md"
      maxWidth="100vw"
      borderWidth="2px"
      borderRadius="md"
      borderColor="gray.400"
    >
      <Collapsible.Root defaultOpen={!stage.chart_id}>
        <Collapsible.Trigger asChild cursor="pointer" w="full">
          <Box as="div" onClick={toggleOpen}>
            {/* Stage Header */}
            <Box w="full" fontWeight="bold" textAlign="start">
              <HStack>
                <IoChevronForward
                  style={{
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease',
                  }}
                />
                Chosen: {!stage.charts && <Span fontWeight="normal">???</Span>}
              </HStack>
            </Box>
            {stage.charts && (
              <Box mt={1}>
                <ChartRow chart={stage.charts} />
              </Box>
            )}

            {/* Admin Buttons */}
            {!loadingAdmin && admin && (
              <HStack alignContent={"center"} justify={"center"} mt={2}>
                <DeleteStageButton
                  round={round}
                  stageId={stage.id}
                  setStages={setStages}
                />

                {!stage.chart_id &&
                  stage.chart_pools &&
                  stage.chart_pools.length !== 0 && (
                    <RollChartButton
                      stageId={stage.id}
                      onClick={onRollChart}
                    />
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
                        color={"purple.fg"}
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
          <Separator
            size="lg"
            borderColor="gray.800"
            borderWidth="1px"
            mt={2}
          />

          {!loadingAdmin && admin && (
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
  );
}