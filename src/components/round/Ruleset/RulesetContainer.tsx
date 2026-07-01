import { Box, Heading } from "@chakra-ui/react";
import ChartRulesCard from "../../rulesets/ChartRulesCard";

import type { RoundPool } from "../../../types/RoundPool";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";

interface RulesetContainerProps {
  activeConfig: ChartdrawConfigWithSpecs;
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
  pickbanRulesets: PickbanRulesetWithSteps[];
  roundPools: RoundPool[];
  setRoundPools: React.Dispatch<React.SetStateAction<RoundPool[]>>;
}

export default function RulesetContainer({
  activeConfig,
  setChartdrawConfigs,
  pickbanRulesets,
  roundPools,
  setRoundPools
}: RulesetContainerProps) {
  return (
    <Box w={{ base: "100%", md: "700px" }} h="fit-content">
      <Heading mb={2}>Active Ruleset</Heading>
      <ChartRulesCard
        chartDrawConfig={activeConfig}
        setChartdrawConfigs={setChartdrawConfigs}
        pickbanRulesets={pickbanRulesets}
        roundPools={roundPools}
        setRoundPools={setRoundPools}
      />
    </Box>
  );
}