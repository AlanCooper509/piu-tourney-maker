import React, { useState } from "react";
import { Stack, Box, Collapsible, HStack, Heading, Center, Text } from "@chakra-ui/react";
import { IoChevronForward } from "react-icons/io5";

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
  // starts collapsed when the columns stack (below Chakra's lg breakpoint, 1024px), open on desktop
  const [isOpen, setIsOpen] = useState(() => window.matchMedia("(min-width: 1024px)").matches);

  const unassignedPools = roundPools.filter(
    (pool) => !pool.chartdraw_config_id || !validConfigIds.includes(pool.chartdraw_config_id)
  );

  return (
    <Box
      // stacked (below lg): full width up to md, same as the Players / Bracket columns. Side by side: a fixed 360px,
      // so collapsing it never changes its width and shifts the other columns
      w={{ base: "100%", lg: "360px" }}
      maxW={{ base: "md", lg: "360px" }}
      mx={{ base: "auto", lg: 0 }} // centered when the columns stack
      flexShrink={0}
      h="fit-content"
    >
      <Collapsible.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
        <HStack
          mb={isOpen ? 3 : 0}
          justifyContent={!loadingTourneyAdminStatus && isTourneyAdmin ? "space-between" : "center"}
          alignItems="center"
          px={1}
          minHeight={!loadingTourneyAdminStatus && isTourneyAdmin ? "36px" : "24px"}
        >
          <Collapsible.Trigger asChild cursor="pointer">
            <HStack gap={2}>
              <IoChevronForward
                style={{
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
              <Heading size="md" color="gray.200" whiteSpace="nowrap">
                Rulesets ({chartdrawConfigs.length})
              </Heading>
            </HStack>
          </Collapsible.Trigger>
          {!loadingTourneyAdminStatus && isTourneyAdmin && (
            <RulesetPopover setChartdrawConfigs={setChartdrawConfigs} />
          )}
        </HStack>
        <Collapsible.Content>
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
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}