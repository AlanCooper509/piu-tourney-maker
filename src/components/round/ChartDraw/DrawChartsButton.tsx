import { useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { GiRollingDices } from "react-icons/gi";

import { toaster } from "../../ui/toaster";
import { handleDrawChartsFromConfig } from "../../../handlers/chartdraw/handleDrawChartsFromConfig";

import type { Round } from "../../../types/Round";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";

interface DrawChartsButtonProps {
  round: Round | null;
  activeConfig: ChartdrawConfigWithSpecs;
}

export default function DrawChartsButton({ round, activeConfig }: DrawChartsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Calculate the total aggregate count of charts for the button label
  const totalCharts = activeConfig.chartdraw_config_specs.reduce(
    (acc, spec) => acc + (Number(spec.quantity) || 0), 
    0
  );

  const onDrawCharts = async () => {
    try {
      if (!round) throw new Error("No round selected for chart draw.");
      setIsLoading(true);

      await handleDrawChartsFromConfig(round.id, activeConfig);

      toaster.create({
        title: "Charts Drawn",
        description: "Successfully drew the charts for the selected ruleset.",
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Charts Draw Failed",
        description: err.message || "Could not draw the requested charts.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IconButton
      aria-label="Draw Charts"
      variant="outline"
      borderWidth={2}
      size="xl"
      colorPalette="teal"
      onClick={onDrawCharts}
      px={4}
      loading={isLoading}
    >
      Draw {totalCharts} Charts <GiRollingDices />
    </IconButton>
  );
}