import { useState } from "react";
import { Box, Card, Heading, IconButton, Separator, Text, VStack } from "@chakra-ui/react";
import { GiRollingDices } from "react-icons/gi";

import { toaster } from "../../ui/toaster";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { handleDrawChartsFromConfig } from "../../../handlers/chartdraw/handleDrawChartsFromConfig";

import type { Round } from "../../../types/Round";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import ChartDrawEntry from "./ChartDrawEntry";
import ResetChartsDialog from "./ResetChartsDialog";

interface ChartDrawContainerProps {
  round: Round | null;
  activeConfig: ChartdrawConfigWithSpecs;
  pickbanRulesets: PickbanRulesetWithSteps[];
  chartdrawEntries: ChartdrawEntryWithDetails[];
}

export default function ChartDrawContainer({ round, activeConfig, pickbanRulesets, chartdrawEntries }: ChartDrawContainerProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    tourney?.id ?? undefined
  );

  // TODO: prevent typescript from complaining while prototyping (delete later)
  console.log(pickbanRulesets, activeConfig);
  const [isLoading, setIsLoading] = useState(false);

  const onDrawCharts = async () => {
    if (!activeConfig) return;

    try {
      if (!round) {
        throw new Error("No round selected for chart draw.");
      }
      if (!activeConfig) {
        throw new Error("No active ruleset configuration found.");
      }
      setIsLoading(true);
      await handleDrawChartsFromConfig(round.id, activeConfig);

      toaster.create({
        title: "Charts Drawn",
        description: "Successfully drew the charts for the selected ruleset.",
        type: "success",
      });
      return true;

    } catch (err: any) {
      toaster.create({
        title: "Charts Draw Failed",
        description: err.message || "Could not draw the requested charts.",
        type: "error",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // calculate the total aggregate count of charts
  const totalCharts = activeConfig.chartdraw_config_specs.reduce((acc, spec) => acc + (Number(spec.quantity) || 0), 0);
  return (
    <Box w={{ base: "100%", md: "700px" }} h="fit-content">
      <Heading mb={2}>Chart Draw</Heading>
      <Card.Root variant="outline" size="sm">
        <Card.Body>
          <VStack align="center">
            {!loadingTourneyAdminStatus && isTourneyAdmin && chartdrawEntries.length == 0 && (
              <>
                <IconButton
                  aria-label="Draw Charts"
                  variant="outline"
                  borderWidth={2}
                  size="sm"
                  colorPalette="teal"
                  onClick={() => onDrawCharts()}
                  px={2}
                  loading={isLoading}
                >
                  Draw {totalCharts} Charts<GiRollingDices />
                </IconButton>
                <Separator mt={2} width="100%" />
              </>
            )}
            {chartdrawEntries.length === 0 ? (
              <Text color="fg.muted" fontSize="sm" whiteSpace="nowrap" fontStyle="italic">
                Charts have not been drawn yet!
              </Text>
            ) : (
              <VStack align="stretch" width="100%" mt={2}>
                {chartdrawEntries.map((entry) => (
                  <ChartDrawEntry
                    key={entry.id}
                    chartdrawEntry={entry}
                  />
                ))}
                {!loadingTourneyAdminStatus && isTourneyAdmin && (
                  <>
                    <Separator mt={2} mb={2} width="100%" />
                    <Box alignItems="center" display="flex" justifyContent="center" width="100%">
                      <ResetChartsDialog round={round} />
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}