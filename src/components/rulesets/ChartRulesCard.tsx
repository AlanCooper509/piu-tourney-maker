import React from "react";
import { Stack, Text, Card, HStack, Separator } from "@chakra-ui/react";

import PickBanFlowCollapsible from "../pickban/PickBanFlowCollapsible";
import ChartSpecsCollapsible from "./chartdrawspecs/ChartSpecsCollapsible";
import { RulesetPopover } from "./popover/RulesetPopover";
import RoundPoolsList from "./roundpools/RoundPoolsList";

import type { RoundPool } from "../../types/RoundPool";
import type { ChartdrawConfigWithSpecs } from "../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../types/Pickban";

interface ChartRulesCardProps {
  chartDrawConfig: ChartdrawConfigWithSpecs;
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
  pickbanRulesets: PickbanRulesetWithSteps[];
  roundPools: RoundPool[];
  setRoundPools: React.Dispatch<React.SetStateAction<RoundPool[]>>;
  isTourneyAdmin: boolean;
  loadingTourneyAdminStatus: boolean;
}

export default function ChartRulesCard({
  chartDrawConfig,
  setChartdrawConfigs,
  pickbanRulesets,
  roundPools,
  setRoundPools,
  isTourneyAdmin,
  loadingTourneyAdminStatus,
}: ChartRulesCardProps) {
  // find the linked Pick/Ban ruleset with its attached sequence steps
  const linkedPickbanRuleset = pickbanRulesets.find(
    (ruleset) => ruleset.id === chartDrawConfig.pickban_ruleset_id
  );

  const totalCharts =
    chartDrawConfig.chartdraw_config_specs?.reduce(
      (acc, spec) => acc + (Number(spec.quantity) || 0),
      0
    ) || 0;

  return (
    <Card.Root variant="outline" size="sm">
      <Card.Body>
        <Stack gap={0} width="100%">
          {/* header section with name */}
          <HStack justify="space-between" align="center" mb={2}>
            <Text fontSize="md" fontWeight="bold">
              {chartDrawConfig.name}
            </Text>
            {!loadingTourneyAdminStatus && isTourneyAdmin && (
              <RulesetPopover
                config={chartDrawConfig}
                setChartdrawConfigs={setChartdrawConfigs}
              />
            )}
          </HStack>

          {/* round pools listing */}
          <RoundPoolsList
            chartdrawConfig={chartDrawConfig}
            roundPools={roundPools}
            setRoundPools={setRoundPools}
          />

          <Separator gap={2} py={1} mt={3} />

          {/* chart draw details */}
          <ChartSpecsCollapsible
            chartdrawConfig={chartDrawConfig}
            setChartdrawConfigs={setChartdrawConfigs}
          />

          {/* pick/ban ruleset */}
          <PickBanFlowCollapsible
            chartdrawConfig={chartDrawConfig}
            pickbanRulesets={pickbanRulesets}
            linkedPickbanRuleset={linkedPickbanRuleset}
            totalCharts={totalCharts}
          />
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}