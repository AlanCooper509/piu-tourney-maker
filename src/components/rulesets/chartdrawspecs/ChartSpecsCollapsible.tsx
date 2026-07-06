import React from "react";
import { Badge, Box, Collapsible, HStack, Text, Stack, Separator } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { GiRollingDices } from "react-icons/gi";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { shortenChartType } from "../../../helpers/shortenChartType";
import AddChartSpecDialog from "./AddChartSpecDialog";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import ChartdrawSpecsList from "./ChartdrawSpecsList";
import { ChartdrawSpecsDurationsList } from "./ChartdrawSpecsDurationsList";

interface ChartSpecsCollapsibleProps {
  chartdrawConfig: ChartdrawConfigWithSpecs;
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
}

export default function ChartSpecsCollapsible({ chartdrawConfig, setChartdrawConfigs }: ChartSpecsCollapsibleProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const specs = chartdrawConfig.chartdraw_config_specs || [];

  // calculate the total aggregate count of charts
  const totalCharts = specs.reduce((acc, spec) => acc + (Number(spec.quantity) || 0), 0);

  // build an array of Badge elements for the header preview
  const levelParts: React.ReactNode[] = [];

  // singles
  const singles = specs.filter((s) => s.chart_type === "Single");
  if (singles.length > 0) {
    const mins = singles.map((s) => s.level_min);
    const maxes = singles.map((s) => s.level_max);
    const min = Math.min(...mins);
    const max = Math.max(...maxes);
    const text = min === max ? `S${min}` : `S${min}-${max}`;
    levelParts.push(
      <Badge key="singles" colorPalette="red" variant="subtle" size="sm">
        {text}
      </Badge>
    );
  }

  // doubles
  const doubles = specs.filter((s) => s.chart_type === "Double");
  if (doubles.length > 0) {
    const mins = doubles.map((s) => s.level_min);
    const maxes = doubles.map((s) => s.level_max);
    const min = Math.min(...mins);
    const max = Math.max(...maxes);
    const text = min === max ? `D${min}` : `D${min}-${max}`;
    levelParts.push(
      <Badge key="doubles" colorPalette="green" variant="subtle" size="sm">
        {text}
      </Badge>
    );
  }

  // co-op
  const coop = specs.filter((s) => s.chart_type === "Co-Op");
  if (coop.length > 0) {
    const mins = coop.map((s) => s.level_min);
    const maxes = coop.map((s) => s.level_max);
    const min = Math.min(...mins);
    const max = Math.max(...maxes);
    const text = min === max ? `C${min}` : `C${min}-${max}`;
    levelParts.push(
      <Badge key="coop" colorPalette="yellow" variant="subtle" size="sm">
        {text}
      </Badge>
    );
  }

  // other chart types
  const others = specs.filter((s) => s.chart_type !== "Single" && s.chart_type !== "Double" && s.chart_type !== "Co-Op");
  if (others.length > 0) {
    const types = Array.from(new Set(others.map((s) => shortenChartType(s.chart_type))));
    levelParts.push(
      <Badge key="others" colorPalette="gray" variant="subtle" size="sm">
        {types.join(", ")}
      </Badge>
    );
  }

  // join levelParts together
  const levelsSummary = levelParts.reduce<React.ReactNode[]>((acc, curr, index) => {
    if (index === 0) return [curr];
    return [
      ...acc,
      <Text key={`sep-${index}`} as="span" mx={1} fontSize="xs" fontWeight="normal" color="fg.subtle">|</Text>,
      curr
    ];
  }, []);

  return (
    <Collapsible.Root lazyMount unmountOnExit width="100%">
      <Collapsible.Trigger cursor="pointer" width="100%" _hover={{ opacity: 0.8 }}>
        <HStack justify="space-between" align="center" width="100%" gap={3}>

          {/* Left Container: Packs text & badge tightly, wraps them cleanly on mobile */}
          <HStack gap={2} flexWrap="wrap" flex="1" minWidth={0} align="center">

            {/* Charts Inline Block */}
            <HStack gap={1.5} flexWrap="wrap" display="inline-flex" alignItems="center">
              <Text fontSize="xs" fontWeight="medium" color="fg.muted" whiteSpace="nowrap">
                Charts:
              </Text>
              <Text fontSize="xs" fontWeight="medium" color="fg" display="inline-flex" alignItems="center" flexWrap="wrap">
                {levelsSummary.length > 0 ? (
                  <>
                    <Box as="span" mr={0.5} color="fg.muted">(</Box>
                    {levelsSummary}
                    <Box as="span" ml={0.5} color="fg.muted">)</Box>
                  </>
                ) : (
                  <Text as="span" fontSize="xs" color="fg.subtle" fontStyle="italic">None specified</Text>
                )}
              </Text>
            </HStack>

            {/* total charts Badge */}
            <Badge colorPalette="teal" variant="subtle" size="md" gap={1} flexShrink={0}>
              <GiRollingDices /> {totalCharts} {totalCharts === 1 ? "Chart" : "Charts"}
            </Badge>
          </HStack>

          {/* Right Container: Fixed-width Chevron animation */}
          <Collapsible.Context>
            {(context) => (
              <Box
                transform={context.open ? "rotate(180deg)" : undefined}
                transition="transform 0.2s"
                color="fg.muted"
                flexShrink={0}
                display="flex"
                alignItems="center"
              >
                <LuChevronDown size={14} />
              </Box>
            )}
          </Collapsible.Context>

        </HStack>
      </Collapsible.Trigger>

      <Collapsible.Content pt={2}>
        <Stack gap={2.5}>
          {/* Chart Duration Badges */}
          <ChartdrawSpecsDurationsList chartdrawConfig={chartdrawConfig} />

          {/* Chart Level Badges */}
          {specs.length > 0 && (
            <>
              <ChartdrawSpecsList
                specs={specs}
                isTourneyAdmin={isTourneyAdmin}
                loadingTourneyAdminStatus={loadingTourneyAdminStatus}
                chartdrawConfig={chartdrawConfig}
                setChartdrawConfigs={setChartdrawConfigs}
                paddingStart={4}
              />
            </>
          )}

          {!loadingTourneyAdminStatus && isTourneyAdmin && (
            <AddChartSpecDialog configId={chartdrawConfig.id} />
          )}

          <Separator gap={2}></Separator>
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}