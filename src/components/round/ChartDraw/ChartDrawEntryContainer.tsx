import { Box } from "@chakra-ui/react";

import { ChartRow } from "../../charts/ChartRow";

import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";

interface ChartDrawEntryContainerProps {
  chartdrawEntry: ChartdrawEntryWithDetails;
}

export default function ChartDrawEntryContainer({ chartdrawEntry }: ChartDrawEntryContainerProps) {
  return (
    <Box borderWidth={1} borderRadius="md" w="100%">
      {chartdrawEntry.charts && (
        <ChartRow chart={chartdrawEntry.charts} action={chartdrawEntry?.action ?? undefined}/>
      )}
    </Box>
  );
}