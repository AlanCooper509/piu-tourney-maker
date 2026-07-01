import React from "react";
import { Stack, Text, Badge, Box, Card, HStack, Heading } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import { RulesetPopover } from "./popover/RulesetPopover";
import ChartRulesCard from "./ChartRulesCard";

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

  if (!chartdrawConfigs.length) {
    return (
      <Text color="gray.500">
        No chart rulesets available for this tournament.
      </Text>
    );
  }

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
        {/* Round Pools without a Ruleset */}
        {!loadingTourneyAdminStatus && isTourneyAdmin && unassignedPools.length > 0 && (
          <Card.Root variant="outline" size="sm" borderWidth={1} borderColor="orange.700">
            <Card.Body>
              <Box px={3} width="100%">
                {/* Combined header line that handles icon + text */}
                <HStack
                  mb={2.5}
                  gap={1.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <LuTriangleAlert size={16} color="orange" style={{ flexShrink: 0 }} />
                  <Text fontSize="sm" fontWeight="semibold">
                    Round Pools Missing Rulesets:
                  </Text>
                </HStack>

                {/* Badges Layout */}
                <HStack gap={1.5} flexWrap="wrap" justifyContent="center">
                  {unassignedPools.map((pool) => (
                    <Badge
                      key={pool.id}
                      colorPalette="orange"
                      variant="subtle"
                      size="sm"
                    >
                      {pool.name}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            </Card.Body>
          </Card.Root>
        )}

        {/* Listing of Rulesets */}
        {[...chartdrawConfigs]
          .sort((a, b) => a.id - b.id)
          .map((chartDrawConfig) => (
            <ChartRulesCard
              key={chartDrawConfig.id}
              chartDrawConfig={chartDrawConfig}
              setChartdrawConfigs={setChartdrawConfigs}
              pickbanRulesets={pickbanRulesets}
              roundPools={roundPools}
              setRoundPools={setRoundPools}
              isTourneyAdmin={isTourneyAdmin}
              loadingTourneyAdminStatus={loadingTourneyAdminStatus}
            />
          ))}
      </Stack>
    </Box>
  );
}