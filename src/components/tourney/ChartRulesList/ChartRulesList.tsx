import { Stack, Text, Badge, Box, Card, HStack, Heading, Separator } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

import PickBanFlowCollapsible from "./PickBanFlowCollapsible";
import ChartSpecsCollapsible from "./ChartSpecsCollapsible";
import AppliedPoolsList from "./AppliedPoolsList";

import type { RoundPool } from "../../../types/RoundPool";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSequences } from "../../../types/Pickban";


interface ChartRulesListProps {
  chartdrawConfigs: ChartdrawConfigWithSpecs[];
  pickbanRulesets: PickbanRulesetWithSequences[];
  roundPools: RoundPool[];
}

export default function ChartRulesList({ chartdrawConfigs, pickbanRulesets, roundPools }: ChartRulesListProps) {
  if (!chartdrawConfigs.length) {
    return <Text color="gray.500">No chart rulesets available for this tournament.</Text>;
  }

  // get all round pools that don't have a ruleset linked to them
  const validConfigIds = chartdrawConfigs.map(c => c.id);
  const unassignedPools = roundPools.filter(
    (pool) => !pool.chartdraw_config_id || !validConfigIds.includes(pool.chartdraw_config_id)
  );

  return (
    <Stack>
      <Heading size="md">Rulesets</Heading>

      {/* Round Pools without a Ruleset */}
      {unassignedPools.length > 0 && (
        <Box p={3} width="100%">
          {/* Combined header line that handles icon + text seamlessly */}
          <HStack 
            mb={2.5} 
            gap={1.5} 
            alignItems="center" 
            justifyContent={"center"}
          >
            <LuTriangleAlert size={16} color="orange" style={{ flexShrink: 0 }} />
            <Text fontSize="sm" fontWeight="semibold">
              Round Pools Missing Rulesets:
            </Text>
          </HStack>
          
          {/* Badges Layout */}
          <HStack gap={1.5} flexWrap="wrap" justifyContent={["center", "flex-start"]}>
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
      )}

      {/* Listing of Rulesets */}
      {chartdrawConfigs.map((config) => {
        // get all round pools pointing to this configuration profile
        const matchingPools = roundPools.filter(
          (pool) => pool.chartdraw_config_id === config.id
        );

        // find the linked Pick/Ban ruleset with its attached sequence steps
        const linkedRuleset = pickbanRulesets.find(
          (ruleset) => ruleset.id === config.pickban_ruleset_id
        );

        const totalCharts = config.chartdraw_config_specs?.reduce(
          (acc, spec) => acc + (Number(spec.quantity) || 0), 0
        ) || 0;

        return (
          <Card.Root key={config.id} variant="outline" size="sm">
            <Card.Body>
                <Stack gap={0} width="100%">
                {/* header section with name */}
                <Text fontSize="md" fontWeight="bold" mb={3}>{config.name}</Text>

                {/* assigned round pools list */}
                <AppliedPoolsList matchingPools={matchingPools} />

                <Separator gap={2} py={1} />

                {/* chart draw details */}
                <ChartSpecsCollapsible config={config} />

                {/* pick/ban ruleset */}
                <PickBanFlowCollapsible linkedRuleset={linkedRuleset} totalCharts={totalCharts} />
              </Stack>
            </Card.Body>
          </Card.Root>
        );
      })}
    </Stack>
  );
}