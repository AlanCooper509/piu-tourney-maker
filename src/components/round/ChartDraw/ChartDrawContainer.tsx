import { Box, Card, Heading, Separator, Text, VStack } from "@chakra-ui/react";

import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import DrawChartsButton from "./DrawChartsButton";
import ChartDrawEntry from "./ChartDrawEntryContainer";
import StartPickBanButton from "./StartPickbBanButton";
import { ChartdrawSpecsDurationsList } from "../../rulesets/chartdrawspecs/ChartdrawSpecsDurationsList";
import ChartdrawSpecsList from "../../rulesets/chartdrawspecs/ChartdrawSpecsList";
import ResetChartsDialog from "./ResetChartsDialog";

import type { Round } from "../../../types/Round";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";

interface ChartDrawContainerProps {
  round: Round | null;
  activeConfig: ChartdrawConfigWithSpecs;
  pickbanRulesets: PickbanRulesetWithSteps[];
  chartdrawEntries: ChartdrawEntryWithDetails[];
}

export default function ChartDrawContainer({ round, activeConfig, pickbanRulesets, chartdrawEntries }: ChartDrawContainerProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    tourney?.id ?? undefined
  );

  const linkedPickbanRuleset = pickbanRulesets.find(
    (ruleset) => ruleset.id === activeConfig.pickban_ruleset_id
  );

  const chartdrawSpecsRender = (
    <VStack align="center" width="100%" mt={2} gap={2}>
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
        badgeVariant="outline"

      />
      <ChartdrawSpecsDurationsList chartdrawConfig={activeConfig} />
    </VStack>
  )

  return (
    <Box w={{ base: "100%", md: "700px" }} h="fit-content">
      <Heading mb={2}>Chart Draw</Heading>
      <Card.Root variant="outline" size="sm">
        <Card.Body>
          <VStack align="center">
            {!loadingTourneyAdminStatus && isTourneyAdmin && (
              <>
                {activeConfig && chartdrawEntries.length === 0 && (
                  <DrawChartsButton round={round} activeConfig={activeConfig} />
                )}

                {chartdrawEntries.length > 0 && linkedPickbanRuleset && linkedPickbanRuleset.pickban_ruleset_steps.length > 0 && (
                  <StartPickBanButton
                    pickbanRuleset={linkedPickbanRuleset}
                  />
                )}
                <Separator mt={2} width="100%" />
              </>
            )}
            {chartdrawEntries.length === 0 ? (
              <>
                {chartdrawSpecsRender}
                <Separator mt={2} width="100%" />
                <Text color="fg.muted" fontSize="sm" whiteSpace="nowrap" fontStyle="italic">
                  Charts have not been drawn yet!
                </Text>
              </>

            ) : (
              <VStack align="stretch" width="100%" mt={2} gap={1.5}>
                {chartdrawEntries.sort((a, b) => a.order - b.order).map((entry) => (
                  <ChartDrawEntry
                    key={entry.id}
                    chartdrawEntry={entry}
                  />
                ))}
                <Separator mt={2} width="100%" />
                {chartdrawSpecsRender}
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