import { Button } from "@chakra-ui/react";

interface RollChartButtonProps {
  stageId: number;
  onClick: (stageId: number) => void;
}

export function RollChartButton({ stageId, onClick }: RollChartButtonProps) {
  return (
    <Button my={2} colorPalette="blue" onClick={() => onClick(stageId)}>
      Roll the Chart
    </Button>
  );
}