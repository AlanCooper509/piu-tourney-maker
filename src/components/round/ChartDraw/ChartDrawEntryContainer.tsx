import { Box } from "@chakra-ui/react";

import { ChartRow } from "../../charts/ChartRow";

import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";

interface ChartDrawEntryContainerProps {
  chartdrawEntry: ChartdrawEntryWithDetails;
}

export default function ChartDrawEntryContainer({ chartdrawEntry }: ChartDrawEntryContainerProps) {
  const action = chartdrawEntry?.action;
  const actorName = chartdrawEntry.player_rounds?.player_tourneys?.player_name;

  const subtext = action
    ? actorName
      ? `${action} by ${actorName.toUpperCase()}`
      : `${action}`
    : undefined;

  return (
    <Box borderWidth={1} borderRadius="md" w="100%">
      {chartdrawEntry.charts && (
        <ChartRow
          chart={chartdrawEntry.charts}
          action={action ?? undefined}
          subtext={subtext ?? undefined}
        />
      )}
    </Box>
  );
}