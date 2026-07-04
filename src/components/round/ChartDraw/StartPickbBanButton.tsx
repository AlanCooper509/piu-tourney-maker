import { IconButton } from "@chakra-ui/react";
import { LuSwords } from "react-icons/lu";

import { toaster } from "../../ui/toaster";

import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import { useState } from "react";

interface StartPickBanButtonProps {
  pickbanRuleset: PickbanRulesetWithSteps
}

export default function StartPickBanButton({ pickbanRuleset }: StartPickBanButtonProps) {
  const [isLoadingPickbanCharts, setIsLoadingPickbanCharts] = useState(false);

  const onPickbanCharts = async () => {
    if (!pickbanRuleset) {
      toaster.create({
        title: "No Pick/Ban Ruleset Linked",
        description: "Please link a Pick/Ban ruleset to this chart draw configuration before proceeding.",
        type: "error",
      });
      return false;
    }
    try {
      if (!pickbanRuleset) {
        throw new Error("No round selected for chart draw.");
      }
      setIsLoadingPickbanCharts(true);
      // await handlePickbanChartsFromConfig(round.id, linkedPickbanRuleset);

      toaster.create({
        title: "Pick/Ban Charts Drawn",
        description: "Successfully drew the Pick/Ban charts for the selected ruleset.",
        type: "success",
      });
      return true;

    } catch (err: any) {
      toaster.create({
        title: "Pick/Ban Charts Draw Failed",
        description: err.message || "Could not draw the requested Pick/Ban charts.",
        type: "error",
      });
      return false;
    } finally {
      setIsLoadingPickbanCharts(false);
    }
  };

  return (
    <IconButton
      aria-label="Pick/Ban Logic"
      variant="outline"
      borderWidth={2}
      size="xl"
      colorPalette="green"
      onClick={() => onPickbanCharts()}
      px={4}
      loading={isLoadingPickbanCharts}
    >
      Begin Pick/Ban Flow <LuSwords />
    </IconButton>
  );
}