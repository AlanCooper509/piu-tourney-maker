import type { Dispatch, SetStateAction } from "react";
import { Box, Card, Heading, Separator, Text, VStack } from "@chakra-ui/react";

import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import DrawChartsButton from "./DrawChartsButton";
import ChartDrawEntry from "./ChartDrawEntryContainer";
import StartPickBanDialog from "../PickBan/StartPickBanDialog";
import { ChartdrawSpecsDurationsList } from "../../rulesets/chartdrawspecs/ChartdrawSpecsDurationsList";
import ChartdrawSpecsList from "../../rulesets/chartdrawspecs/ChartdrawSpecsList";
import ResetChartsDialog from "./ResetChartsDialog";

import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { Stage } from "../../../types/Stage";

interface ChartDrawContainerProps {
  round: Round | null;
  players: PlayerRound[];
  stages: Stage[];
  activeConfig: ChartdrawConfigWithSpecs;
  pickbanRulesets: PickbanRulesetWithSteps[];
  chartdrawEntries: ChartdrawEntryWithDetails[];
  setChartdrawEntries: Dispatch<SetStateAction<ChartdrawEntryWithDetails[]>>;
}

export default function ChartDrawContainer({ round, players, stages, activeConfig, pickbanRulesets, chartdrawEntries, setChartdrawEntries }: ChartDrawContainerProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    tourney?.id ?? undefined
  );

  const linkedPickbanRuleset = pickbanRulesets.find(
    (ruleset) => ruleset.id === activeConfig.pickban_ruleset_id
  );

  const chartdrawSpecsRender = (
    <VStack align="center" width="100%" my={2} gap={2}>
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

  const readyToStartPickBan = round && players.length == 2 && chartdrawEntries.length > 0 && linkedPickbanRuleset && linkedPickbanRuleset.pickban_ruleset_steps.length > 0;

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

                { readyToStartPickBan && (
                  <StartPickBanDialog
                    pickbanRuleset={linkedPickbanRuleset}
                    chartdrawEntries={chartdrawEntries}
                    setChartdrawEntries={setChartdrawEntries}
                    round={round}
                    players={players}
                    stages={stages}
                  />
                )}
                <Separator mt={2} width="100%" />
              </>
            )}
            {chartdrawEntries.length === 0 ? (
              <>
                <Text color="fg.muted" fontSize="sm" whiteSpace="nowrap" fontStyle="italic" mt={2}>
                  Charts have not been drawn yet!
                </Text>
                <Separator mt={2} width="100%" />
                {chartdrawSpecsRender}
              </>

            ) : (
              <VStack align="stretch" width="100%" mt={2} gap={1.5}>
                {chartdrawEntries.sort((a, b) => a.draw_order - b.draw_order).map((entry) => (
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