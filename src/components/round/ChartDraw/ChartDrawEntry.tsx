import { Box, Span, Text } from "@chakra-ui/react";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";

interface ChartDrawEntryProps {
  chartdrawEntry: ChartdrawEntryWithDetails;
}

export default function ChartDrawEntry({ chartdrawEntry }: ChartDrawEntryProps) {
  return (
  <Box p={2} borderWidth={1} borderRadius="md" w="100%">
    <Text fontSize="sm">
      <Span style={{ fontWeight: "bold" }}>#{chartdrawEntry.order}</Span> - {chartdrawEntry.charts?.name_en} ({chartdrawEntry.charts?.type} {chartdrawEntry.charts?.level})
      {chartdrawEntry.player_rounds?.player_tourneys?.player_name && ` • By: ${chartdrawEntry.player_rounds.player_tourneys.player_name}`}
      {chartdrawEntry.action && chartdrawEntry.action !== null && ` [${chartdrawEntry.action}]`}
    </Text>
  </Box>
  );
}