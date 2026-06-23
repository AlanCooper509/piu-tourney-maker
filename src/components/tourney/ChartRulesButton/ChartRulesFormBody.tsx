import { Stack, Text, Badge, Box, Card, Span, HStack, VStack, Separator } from "@chakra-ui/react";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { RoundPool } from "../../../types/RoundPool";

interface ChartRulesFormBodyProps {
  chartdrawConfigs: ChartdrawConfigWithSpecs[];
  roundPools: RoundPool[];
}

export default function ChartRulesFormBody({ chartdrawConfigs, roundPools }: ChartRulesFormBodyProps) {
  if (!chartdrawConfigs.length) {
    return <Text color="gray.500">No chart rulesets available for this tournament.</Text>;
  }

  // helper to shorten chart type text for visual badges
  const getDisplayType = (type: string) => {
    if (type === "Single") return "S";
    if (type === "Double") return "D";
    return type;
  };

  // get all round pools that don't have a ruleset linked to them
  const validConfigIds = chartdrawConfigs.map(c => c.id);
  const unassignedPools = roundPools.filter(
    (pool) => !pool.chartdraw_config_id || !validConfigIds.includes(pool.chartdraw_config_id)
  );

  return (
    <Stack gap={4} width="100%">
      {chartdrawConfigs.map((config) => {
        // get all round pools pointing to this configuration profile
        const matchingPools = roundPools.filter(
          (pool) => pool.chartdraw_config_id === config.id
        );

        return (
          <Card.Root key={config.id} variant="outline" size="sm">
            <Card.Body gap={3}>
              {/* Header section with Name and primary flags */}
              <Box>
                <Text fontSize="md" fontWeight="bold">{config.name}</Text>
                <VStack align="start" mt={1}>
                  <HStack gap={2} flexWrap="wrap" mt={1}>
                    {config.contains_arcade && <Badge colorPalette="teal" variant="subtle">Arcade</Badge>}
                    {config.contains_shortcut && <Badge colorPalette="purple" variant="subtle">Shortcut</Badge>}
                    {config.contains_remix && <Badge colorPalette="orange" variant="subtle">Remix</Badge>}
                    {config.contains_full && <Badge colorPalette="pink" variant="subtle">Full</Badge>}
                  </HStack>
                  <HStack>
                    {/* Chart Specifications Breakdown */}
                    {config.chartdraw_config_specs?.length > 0 && (
                      <HStack gap={1.5} flexWrap="wrap">
                        {[...config.chartdraw_config_specs]
                          .sort((a, b) => {
                            // sort by Level ascending
                            if (a.level !== b.level) {
                              return a.level - b.level;
                            }
                            // sort by Type Priority (Single, Double, Co-Op, UCS)
                            const typeOrder = ["Single", "Double", "Co-Op", "UCS"];
                            const indexA = typeOrder.indexOf(a.chart_type);
                            const indexB = typeOrder.indexOf(b.chart_type);
                            const priorityA = indexA === -1 ? 99 : indexA;
                            const priorityB = indexB === -1 ? 99 : indexB;
                            return priorityA - priorityB;
                          })
                          .map((spec) => (
                            <Badge
                              key={spec.id}
                              variant="subtle"
                              colorPalette={spec.chart_type === "Single" ? "red" : spec.chart_type === "Double" ? "green" : "gray"}
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              <Span color="white">{getDisplayType(spec.chart_type)}{spec.level}</Span> <Span color="gray.400">×{spec.quantity}</Span>
                              {spec.group && ` [G${spec.group}]`}
                            </Badge>
                          ))}
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </Box>

              {/* Displaying associated Round Pools */}
              <Box>
                {matchingPools.length > 0 ? (
                  <>
                    <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb={1}>
                      Applied to Round Pools:
                    </Text>
                    <HStack direction="row" gap={2} flexWrap="wrap">
                      {matchingPools.map((pool) => (
                        <Badge
                          key={pool.id}
                          colorPalette="blue"
                          variant="subtle"
                          size="sm"
                        >
                          {pool.name}
                        </Badge>
                      ))}
                    </HStack>
                  </>
                ) : (
                  <Text fontSize="xs" color="fg.muted" fontStyle="italic">
                    Not currently assigned to any pools.
                  </Text>
                )}
              </Box>

            </Card.Body>
          </Card.Root>
        );
      })}

      {/* Section for Pools without a Ruleset */}
      {unassignedPools.length > 0 && (
        <Box mt={2}>
          <Separator mb={3} />
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            Round Pools Missing Rulesets
          </Text>
          <HStack gap={1.5} flexWrap="wrap">
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
    </Stack>
  );
}