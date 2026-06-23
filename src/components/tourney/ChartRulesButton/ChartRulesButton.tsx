import { useState } from "react";
import { Button } from "@chakra-ui/react"; // Swapped to Button since it has text content

import DialogForm from "../../ui/DialogForm";
import ChartRulesFormBody from "./ChartRulesFormBody";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { RoundPool } from "../../../types/RoundPool";

interface ChartRulesButtonProps {
  chartdrawConfigs: ChartdrawConfigWithSpecs[] | null;
  roundPools: RoundPool[] | null;
}

export default function ChartRulesButton({ chartdrawConfigs, roundPools }: ChartRulesButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogForm
      title="Chart Draw Rulesets"
      trigger={
        <Button
          colorPalette="yellow"
          variant="outline"
          borderWidth={2}
          size="sm"
          px={3}
        >
          Chart Rules
        </Button>
      }
      formBody={
        <ChartRulesFormBody 
          chartdrawConfigs={chartdrawConfigs || []} 
          roundPools={roundPools || []}
        />
      }
      showSubmit={false}
      loading={false}
      open={open}
      setOpen={setOpen}
      onSubmit={async () => false}
      onCancel={async () => { }}
    />
  );
}