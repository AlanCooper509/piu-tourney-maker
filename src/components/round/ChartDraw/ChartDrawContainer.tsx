import { Box, Card, Heading, Separator, Text, VStack } from "@chakra-ui/react";

import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import ChartDrawEntry from "./ChartDrawEntryContainer";
import { ChartdrawSpecsDurationsList } from "../../rulesets/chartdrawspecs/ChartdrawSpecsDurationsList";
import ChartdrawSpecsList from "../../rulesets/chartdrawspecs/ChartdrawSpecsList";
import ResetChartsDialog from "./ResetChartsDialog";

import type { Round } from "../../../types/Round";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";

interface ChartDrawContainerProps {
  round: Round | null;
  activeConfig: ChartdrawConfigWithSpecs;
  chartdrawEntries: ChartdrawEntryWithDetails[];
}

export default function ChartDrawContainer({ round, activeConfig, chartdrawEntries }: ChartDrawContainerProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    tourney?.id ?? undefined
  );

  const chartdrawSpecsRender = (
    <VStack align="center" width="100%" gap={2}>
      <Heading size="md" fontWeight="semibold">
        Chart Draw Distribution
      </Heading>
      <ChartdrawSpecsList
        specs={activeConfig.chartdraw_config_specs}
        isTourneyAdmin={isTourneyAdmin}
        loadingTourneyAdminStatus={loadingTourneyAdminStatus}
        chartdrawConfig={activeConfig}
        borderWidth={0}
        badgePadding={1.5}
        badgeVariant="surface"
      />
      <ChartdrawSpecsDurationsList chartdrawConfig={activeConfig} />
    </VStack>
  );

  return (
    <Box w={{ base: "100%", md: "700px" }} h="fit-content">
      <Heading mb={2}>Chart Draw</Heading>
      <Card.Root variant="outline" size="sm">
        <Card.Body>
          <VStack align="center">
            {chartdrawEntries.length === 0 ? (
              <>
                {chartdrawSpecsRender}
                <Separator width="100%" mt={2} />
                <Text color="fg.muted" fontSize="sm" whiteSpace="nowrap" fontStyle="italic" mt={2}>
                  Charts have not been drawn yet!
                </Text>
              </>
            ) : (
              <VStack align="stretch" width="100%" mt={2} gap={1.5}>
                {chartdrawSpecsRender}
                <Separator mt={2} width="100%" />
                {chartdrawEntries.map((entry) => (
                  <ChartDrawEntry
                    key={entry.id}
                    chartdrawEntry={entry}
                  />
                ))}
                {!loadingTourneyAdminStatus && isTourneyAdmin && (
                  <>
                    <Separator mt={2} mb={2} width="100%" />
                    <Box alignItems="center" display="flex" justifyContent="end" width="100%">
                      <ResetChartsDialog round={round} />
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}