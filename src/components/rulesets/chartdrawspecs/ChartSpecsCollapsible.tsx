import React from "react";
import { Badge, Box, Collapsible, HStack, Span, Text, Stack, Separator } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { GiRollingDices } from "react-icons/gi";
import { LuX } from "react-icons/lu";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { handleDeleteChartSpecs } from "../../../handlers/chartdraw/handleDeleteChartSpecs";
import AddChartSpecDialog from "./AddChartSpecDialog";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import { toaster } from "../../ui/toaster";

interface ChartSpecsCollapsibleProps {
  chartdrawConfig: ChartdrawConfigWithSpecs;
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
}

export default function ChartSpecsCollapsible({ chartdrawConfig, setChartdrawConfigs }: ChartSpecsCollapsibleProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const specs = chartdrawConfig.chartdraw_config_specs || [];

  // helper to shorten chart type text for visual badges
  const getDisplayType = (type: string) => {
    if (type === "Single") return "S";
    if (type === "Double") return "D";
    if (type === "Co-Op") return "C";
    if (type === "UCS") return "U";
    return type;
  };

  async function onDeleteSpec(specId: number, displayLabel: string) {
    try {
      await handleDeleteChartSpecs(specId);
      setChartdrawConfigs(prev => prev.map(config =>
        config.id === chartdrawConfig.id
          ? { ...config, chartdraw_config_specs: config.chartdraw_config_specs.filter(s => s.id !== specId) }
          : config
      ));
      toaster.create({
        title: "Removed Chart Range",
        description: `Successfully removed ${displayLabel} constraints from the configuration pool.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      console.error("Error deleting chart specification:", err.message);
      toaster.create({
        title: "Error Removing Range",
        description: err.message,
        type: "error",
        closable: true,
      });
    }
  }

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
    const types = Array.from(new Set(others.map((s) => getDisplayType(s.chart_type))));
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
      <Text key={`sep-${index}`} as="span" mx={1} fontSize="xs" fontWeight="normal">|</Text>,
      curr
    ];
  }, []);

  return (
    <Collapsible.Root lazyMount unmountOnExit width="100%">
      <Collapsible.Trigger cursor="pointer" width="100%" _hover={{ opacity: 0.8 }}>
        <HStack justify="space-between" width="100%">
          <HStack gap={2} minWidth={0} width="100%">
            <Text fontSize="xs" fontWeight="medium" color="fg.muted" whiteSpace="nowrap">
              Charts:
            </Text>
            <HStack gap={0} display="inline-flex" alignItems="center" flexWrap="wrap">
              {levelsSummary.length > 0 ? (
                <>({levelsSummary})</>
              ) : (
                <Text fontSize="xs" color="fg.subtle" fontStyle="italic">None specified</Text>
              )}
            </HStack>
            <Badge colorPalette="teal" variant="subtle" size={"md"} gap={1}>
              <GiRollingDices /> {totalCharts} {totalCharts === 1 ? "Chart" : "Charts"}
            </Badge>
          </HStack>

          <Collapsible.Context>
            {(context) => (
              <Box
                transform={context.open ? "rotate(180deg)" : undefined}
                transition="transform 0.2s"
                color="fg.muted"
                flexShrink={0}
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
          <HStack gap={2} flexWrap="wrap" paddingStart={4}>
            {chartdrawConfig.contains_arcade && <Badge colorPalette="teal" variant="subtle">Arcade</Badge>}
            {chartdrawConfig.contains_shortcut && <Badge colorPalette="purple" variant="subtle">Shortcut</Badge>}
            {chartdrawConfig.contains_remix && <Badge colorPalette="orange" variant="subtle">Remix</Badge>}
            {chartdrawConfig.contains_full && <Badge colorPalette="pink" variant="subtle">Full</Badge>}
          </HStack>

          <HStack gap={1.5} flexWrap="wrap" paddingStart={4}>
            {/* Chart Level Badges */}
            {specs.length > 0 && (
              <>
                {[...specs]
                  .sort((a, b) => {
                    const typeOrder = ["Single", "Double", "Co-Op", "UCS"];
                    const indexA = typeOrder.indexOf(a.chart_type);
                    const indexB = typeOrder.indexOf(b.chart_type);
                    const rankA = indexA === -1 ? 99 : indexA;
                    const rankB = indexB === -1 ? 99 : indexB;
                    if (rankA !== rankB) return rankA - rankB;
                    if (a.level_min !== b.level_min) return a.level_min - b.level_min;
                    return a.level_max - b.level_max;
                  })
                  .map((spec) => {
                    const levelString = spec.level_min === spec.level_max
                      ? `${spec.level_min}`
                      : `${spec.level_min}-${spec.level_max}`;

                    const fullDisplayLabel = `${getDisplayType(spec.chart_type)}${levelString}`;
                    return (
                      <Badge
                        key={spec.id}
                        variant="subtle"
                        colorPalette={spec.chart_type === "Single" ? "red" : spec.chart_type === "Double" ? "green" : spec.chart_type === "Co-Op" ? "yellow" : "gray"}
                        borderWidth={2}
                        borderColor={spec.chart_type === "Single" ? "red.800" : spec.chart_type === "Double" ? "green.800" : spec.chart_type === "Co-Op" ? "yellow.800" : "gray.800"}
                        fontSize="xs"
                        p={0}
                        display="inline-flex"
                        alignItems="stretch"
                        overflow="hidden"
                      >
                        <HStack px={2} py={1} gap={1.5} alignItems="center" h="100%">
                          {/* Level Range String */}
                          <Span color="white">{getDisplayType(spec.chart_type)}{levelString}</Span>{" "}

                          {/* Level Range Count */}
                          <Span color="gray.400">×{spec.quantity}</Span>

                          {/* Chart Pool Group */}
                          {spec.group && ` [G${spec.group}]`}
                        </HStack>

                        {/* Admin Option: Delete Specs */}
                        {!loadingTourneyAdminStatus && isTourneyAdmin && (
                          <Box
                            as="button"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            px={2}
                            cursor="pointer"
                            transition="all 0.15s"
                            borderLeft="1px solid"
                            borderColor="whiteAlpha.300"
                            bg="blackAlpha.50"
                            color="whiteAlpha.800"
                            _hover={{
                              bg: "blackAlpha.250",
                              color: "white"
                            }}
                            _active={{ bg: "blackAlpha.400" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSpec(spec.id, fullDisplayLabel);
                            }}
                            aria-label="Delete range spec"
                          >
                            <LuX size={10} strokeWidth={3.5} />
                          </Box>
                        )}
                      </Badge>
                    );
                  })
                }
              </>
            )}
          </HStack>
          {!loadingTourneyAdminStatus && isTourneyAdmin && (
            <AddChartSpecDialog configId={chartdrawConfig.id} />
          )}

          <Separator gap={2}></Separator>
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}