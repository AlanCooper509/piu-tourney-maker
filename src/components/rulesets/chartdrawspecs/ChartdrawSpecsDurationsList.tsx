import { Badge, HStack } from "@chakra-ui/react";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";

interface ChartdrawSpecsDurationsListProps {
  chartdrawConfig: ChartdrawConfigWithSpecs;
}

export function ChartdrawSpecsDurationsList({ chartdrawConfig }: ChartdrawSpecsDurationsListProps) {
  return(
    <HStack gap={2} flexWrap="wrap" paddingStart={4}>
      {chartdrawConfig.contains_arcade && <Badge colorPalette="teal" variant="subtle">Arcade</Badge>}
      {chartdrawConfig.contains_shortcut && <Badge colorPalette="purple" variant="subtle">Shortcut</Badge>}
      {chartdrawConfig.contains_remix && <Badge colorPalette="orange" variant="subtle">Remix</Badge>}
      {chartdrawConfig.contains_full && <Badge colorPalette="pink" variant="subtle">Full</Badge>}
    </HStack>
  );
}