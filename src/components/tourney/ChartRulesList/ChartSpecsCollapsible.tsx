import React from "react";
import { Badge, Box, Collapsible, HStack, Span, Text, Stack } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { GiRollingDices } from "react-icons/gi";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
interface ChartSpecsCollapsibleProps {
  config: ChartdrawConfigWithSpecs;
}

export default function ChartSpecsCollapsible({ config }: ChartSpecsCollapsibleProps) {
  const specs = config.chartdraw_config_specs || [];

  // helper to shorten chart type text for visual badges
  const getDisplayType = (type: string) => {
    if (type === "Single") return "S";
    if (type === "Double") return "D";
    return type;
  };
  
  // calculate the total aggregate count of charts
  const totalCharts = specs.reduce((acc, spec) => acc + (Number(spec.quantity) || 0), 0);
  
  // build an array of Badge elements for the header preview
  const levelParts: React.ReactNode[] = [];

  // singles
  const singles = specs.filter((s) => s.chart_type === "Single");
  if (singles.length > 0) {
    const levels = singles.map((s) => s.level);
    const min = Math.min(...levels);
    const max = Math.max(...levels);
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
    const levels = doubles.map((s) => s.level);
    const min = Math.min(...levels);
    const max = Math.max(...levels);
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
    const levels = coop.map((s) => s.level);
    const min = Math.min(...levels);
    const max = Math.max(...levels);
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
          {/* Style / Game Mode Badges */}
          <HStack gap={2} flexWrap="wrap">
            {config.contains_arcade && <Badge colorPalette="teal" variant="subtle">Arcade</Badge>}
            {config.contains_shortcut && <Badge colorPalette="purple" variant="subtle">Shortcut</Badge>}
            {config.contains_remix && <Badge colorPalette="orange" variant="subtle">Remix</Badge>}
            {config.contains_full && <Badge colorPalette="pink" variant="subtle">Full</Badge>}
          </HStack>

          {/* Granular Chart Level Badges */}
          {specs.length > 0 && (
            <HStack gap={1.5} flexWrap="wrap">
              {[...specs]
                .sort((a, b) => {
                  if (a.level !== b.level) return a.level - b.level;
                  const typeOrder = ["Single", "Double", "Co-Op", "UCS"];
                  const indexA = typeOrder.indexOf(a.chart_type);
                  const indexB = typeOrder.indexOf(b.chart_type);
                  return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
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
                    <Span color="white">{getDisplayType(spec.chart_type)}{spec.level}</Span>{" "}
                    <Span color="gray.400">×{spec.quantity}</Span>
                    {spec.group && ` [G${spec.group}]`}
                  </Badge>
                ))}
            </HStack>
          )}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}