import React from "react";
import { Stack, Box, HStack, Heading, Center, Text } from "@chakra-ui/react";

import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import { RulesetPopover } from "./popover/RulesetPopover";
import ChartRulesCard from "./ChartRulesCard";
import UnassignedPoolsWarning from "./unassignedpools/UnassignedPoolsWarning";

import type { RoundPool } from "../../types/RoundPool";
import type { ChartdrawConfigWithSpecs } from "../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../types/Pickban";

interface ChartRulesListProps {
  chartdrawConfigs: ChartdrawConfigWithSpecs[];
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
  pickbanRulesets: PickbanRulesetWithSteps[];
  roundPools: RoundPool[];
  setRoundPools: React.Dispatch<React.SetStateAction<RoundPool[]>>;
}

export default function ChartRulesList({
  chartdrawConfigs,
  setChartdrawConfigs,
  pickbanRulesets,
  roundPools,
  setRoundPools,
}: ChartRulesListProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    tourney?.id ?? undefined
  );

  // get all round pools that don't have a ruleset linked to them
  const validConfigIds = chartdrawConfigs.map((c) => c.id);
  const unassignedPools = roundPools.filter(
    (pool) => !pool.chartdraw_config_id || !validConfigIds.includes(pool.chartdraw_config_id)
  );

  return (
    <Box w={{ base: "100%", md: "400px" }} h="fit-content">
      <HStack
        mb={3}
        justifyContent="center"
        alignItems="center"
        px={1}
        minHeight={!loadingTourneyAdminStatus && isTourneyAdmin ? "36px" : "24px"}
      >
        <Heading size="md">Rulesets</Heading>
        {!loadingTourneyAdminStatus && isTourneyAdmin && (
          <RulesetPopover setChartdrawConfigs={setChartdrawConfigs} />
        )}
      </HStack>
      <Stack gap={3}>
        {/* Round Pools Warning */}
        {!loadingTourneyAdminStatus && isTourneyAdmin && (
          <UnassignedPoolsWarning unassignedPools={unassignedPools} />
        )}

        {chartdrawConfigs.length === 0 ? (
          <Center w="100%" py={4}>
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              No rulesets yet.
            </Text>
          </Center>
        ) : (
          [...chartdrawConfigs]
            .sort((a, b) => a.id - b.id)
            .map((chartDrawConfig) => (
              <ChartRulesCard
                key={chartDrawConfig.id}
                chartDrawConfig={chartDrawConfig}
                setChartdrawConfigs={setChartdrawConfigs}
                pickbanRulesets={pickbanRulesets}
                roundPools={roundPools}
                setRoundPools={setRoundPools}
              />
            ))
        )}
      </Stack>
    </Box>
  );
}