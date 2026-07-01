import { Badge, Box, Collapsible, HStack, Span, Text, Stack, VStack } from "@chakra-ui/react";
import { LuChevronDown, LuTriangleAlert } from "react-icons/lu";
import { LiaCheckCircle } from "react-icons/lia";

import AddPickBanFlowDialog from "../PickbanFlows/AddPickBanFlowDialog";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import LinkExistingPickbanToRulesetSelect from "../PickbanFlows/LinkExistingPickbanToRulesetSelect";
import RemovePickbanFromRulesetButton from "../PickbanFlows/RemovePickbanFromRulesetButton";

import type { PickbanRulesetWithSteps, PickbanAction } from "../../../types/Pickban";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";

interface PickBanFlowCollapsibleProps {
  chartdrawConfig: ChartdrawConfigWithSpecs;
  pickbanRulesets: PickbanRulesetWithSteps[];
  linkedPickbanRuleset: PickbanRulesetWithSteps | null | undefined;
  totalCharts: number;
}

export default function PickBanFlowCollapsible({ chartdrawConfig, pickbanRulesets, linkedPickbanRuleset, totalCharts }: PickBanFlowCollapsibleProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const sequences = linkedPickbanRuleset?.pickban_ruleset_steps || [];
  const hasSequences = sequences.length > 0;

  let banCount = 0;
  let pickCount = 0;
  let autopickCount = 0;
  let protectCount = 0;
  let ignoreCount = 0;

  sequences.forEach((s) => {
    const action = s.action?.toUpperCase() as PickbanAction;
    if (action === "BAN") banCount++;
    if (action === "PICK") pickCount++;
    if (action === "AUTOPICK") autopickCount++;
    if (action === "PROTECT") protectCount++;
    if (action === "IGNORE") ignoreCount++;
  });

  const totalRequired = banCount + pickCount + autopickCount + protectCount;
  const isOverdrawn = totalRequired > totalCharts;
  const finalPlayableCount = pickCount + autopickCount;

  const getActionColorPalette = (action: string) => {
    const act = action.toUpperCase() as PickbanAction;
    switch (act) {
      case "BAN": return "red";
      case "PICK": return "green";
      case "AUTOPICK": return "teal";
      case "PROTECT": return "blue";
      case "IGNORE": return "gray";
      default: return "gray";
    }
  };

  return (
    <Collapsible.Root lazyMount unmountOnExit pt={2}>
      <Collapsible.Trigger cursor="pointer" width="100%" _hover={{ opacity: 0.8 }}>
        <HStack justify="space-between" width="100%">
          <HStack gap={2} flexWrap="wrap">
            <Text fontSize="xs" fontWeight="medium" color="fg.muted">
              Pick/Ban Flow: <Span fontWeight="bold" color="fg.default">{linkedPickbanRuleset?.name ? linkedPickbanRuleset?.name : ""}</Span>
            </Text>

            {hasSequences ? (
              isOverdrawn ? (
                <Badge colorPalette="red" variant="subtle" size={"md"} gap={1}>
                  <LuTriangleAlert size={12} /> Missing {totalRequired - totalCharts} charts
                </Badge>
              ) : (
                <Badge colorPalette="green" variant="subtle" size={"md"} gap={1}>
                  <LiaCheckCircle size={12} /> {finalPlayableCount} {finalPlayableCount === 1 ? "Stage" : "Stages"}
                </Badge>
              )
            ) : (
              <Badge colorPalette="red" variant="subtle" size={"md"} gap={1}>
                <LuTriangleAlert size={12} /> No Pick/Ban Ruleset
              </Badge>
            )}
          </HStack>

          <Collapsible.Context>
            {(context) => (
              <Box
                transform={context.open ? "rotate(180deg)" : undefined}
                transition="transform 0.2s"
                color="fg.muted"
              >
                <LuChevronDown size={14} />
              </Box>
            )}
          </Collapsible.Context>
        </HStack>
      </Collapsible.Trigger>

      <Collapsible.Content pt={2}>
        <Stack gap={3}>
          {linkedPickbanRuleset ? (
            <>
              {hasSequences ? (
                <>
                  <HStack gap={1.5} flexWrap="wrap" paddingStart={4}>
                    {[...sequences]
                      .sort((a, b) => Number(a.sequence) - Number(b.sequence))
                      .map((step) => (
                        <Badge
                          key={step.id}
                          variant="outline"
                          colorPalette={getActionColorPalette(step.action)}
                          fontSize="xs"
                          px={1.5}
                          py={0.5}
                        >
                          <Span fontWeight="bold" color="fg.muted" mr={0.5}>{step.sequence}.</Span>
                          {step.actor ? `${step.actor.toUpperCase()} ` : ""}
                          {step.action?.toUpperCase()}
                        </Badge>
                      ))}
                  </HStack>

                  <Text fontSize="xx-small" color="fg.muted" fontStyle="italic" paddingStart={4}>
                    Pool Summary: Draw {totalCharts} → Play {finalPlayableCount} ({pickCount} Pick, {autopickCount} Auto) → Leftover Unpicked: {Math.max(0, totalCharts - totalRequired)}
                  </Text>
                </>
              ) : (
                <Text fontSize="xs" color="fg.muted" fontStyle="italic" pl={1}>
                  No pick/ban sequence actions configured yet.
                </Text>
              )}
              {!loadingTourneyAdminStatus && isTourneyAdmin && (
                <RemovePickbanFromRulesetButton
                  configId={chartdrawConfig.id}
                />
              )}
            </>
          ) : (
            (!loadingTourneyAdminStatus && isTourneyAdmin) ? (
              <VStack gap={2} width="100%" alignItems="stretch">
                  <HStack gap={3} width="100%" alignItems="center">
                    <Box flex="1">
                      <LinkExistingPickbanToRulesetSelect
                        configId={chartdrawConfig.id}
                        pickbanRulesets={pickbanRulesets}
                      />
                    </Box>
                    <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap" fontWeight="bold">
                      or
                    </Text>
                  </HStack>
                  <AddPickBanFlowDialog
                    configId={chartdrawConfig.id}
                    totalCharts={totalCharts}
                  />
                </VStack>
            ) : (
              <Text fontSize="x-small" color="fg.muted" fontStyle="italic">
                Pick/ban ruleset has not been added yet.
              </Text>
            )
          )}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}