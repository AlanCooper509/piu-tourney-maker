import { Badge, Box, HStack, Span } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

import { toaster } from "../../ui/toaster";
import { shortenChartType } from "../../../helpers/shortenChartType";
import { handleDeleteChartSpecs } from "../../../handlers/chartdraw/handleDeleteChartSpecs";

import type { ChartdrawConfigSpec, ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { ComponentProps } from "react";

interface ChartdrawSpecsListProps {
  specs: ChartdrawConfigSpec[];
  isTourneyAdmin?: boolean;
  loadingTourneyAdminStatus?: boolean;
  chartdrawConfig: ChartdrawConfigWithSpecs;
  setChartdrawConfigs?: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
  paddingStart?: number | string;
  badgePadding?: number | string;
  borderWidth?: number | string;
  badgeVariant?: ComponentProps<typeof Badge>["variant"];
}

export default function ChartdrawSpecsList({
  specs,
  isTourneyAdmin = false,
  loadingTourneyAdminStatus = false,
  chartdrawConfig,
  setChartdrawConfigs,
  paddingStart = 0,
  badgePadding = 0,
  borderWidth = 2,
  badgeVariant = "subtle"
}: ChartdrawSpecsListProps) {
  if (!specs || specs.length === 0) return null;

  // Enforce consistent type-sorting hierarchy: Single -> Double -> Co-Op -> UCS
  const sortedSpecs = [...specs].sort((a, b) => {
    const typeOrder = ["Single", "Double", "Co-Op", "UCS"];
    const indexA = typeOrder.indexOf(a.chart_type);
    const indexB = typeOrder.indexOf(b.chart_type);
    const rankA = indexA === -1 ? 99 : indexA;
    const rankB = indexB === -1 ? 99 : indexB;

    if (rankA !== rankB) return rankA - rankB;
    if (a.level_min !== b.level_min) return a.level_min - b.level_min;
    return a.level_max - b.level_max;
  });

  const showDeleteAction = !loadingTourneyAdminStatus && isTourneyAdmin && setChartdrawConfigs;

  async function onDeleteSpec(specId: number, displayLabel: string) {
    try {
      await handleDeleteChartSpecs(specId);
      setChartdrawConfigs && setChartdrawConfigs(prev => prev.map(config =>
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

  return (
      <HStack gap={1.5} flexWrap="wrap" paddingStart={paddingStart}>
        {sortedSpecs.map((spec) => {
          const levelString =
            spec.level_min === spec.level_max
              ? `${spec.level_min}`
              : `${spec.level_min}-${spec.level_max}`;

          const fullDisplayLabel = `${shortenChartType(spec.chart_type)}${levelString}`;

          return (
            <Badge
              key={spec.id}
              variant={badgeVariant}
              colorPalette={
                spec.chart_type === "Single"
                  ? "red"
                  : spec.chart_type === "Double"
                    ? "green"
                    : spec.chart_type === "Co-Op"
                      ? "yellow"
                      : "gray"
              }
              borderWidth={borderWidth}
              borderColor={
                spec.chart_type === "Single"
                  ? "red.800"
                  : spec.chart_type === "Double"
                    ? "green.800"
                    : spec.chart_type === "Co-Op"
                      ? "yellow.800"
                      : "gray.800"
              }
              fontSize="xs"
              p={badgePadding}
              display="inline-flex"
              alignItems="stretch"
              overflow="hidden"
            >
              <HStack px={2} py={1} gap={1.5} alignItems="center" h="100%">
                {/* Level Range String (e.g., S22, D23-24) */}
                <Span color="white">{fullDisplayLabel}</Span>{" "}

                {/* Quantity Counter */}
                <Span color="gray.400">×{spec.quantity}</Span>

                {/* Chart Pool Grouping Info */}
                {spec.group && ` [G${spec.group}]`}
              </HStack>

              {/* Admin Delete Action Segment */}
              {showDeleteAction && (
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
                    color: "white",
                  }}
                  _active={{ bg: "blackAlpha.400" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSpec?.(spec.id, fullDisplayLabel);
                  }}
                  aria-label="Delete range spec"
                >
                  <LuX size={10} strokeWidth={3.5} />
                </Box>
              )}
            </Badge>
          );
        })}
    </HStack>
  );
}