import { IconButton } from "@chakra-ui/react";
import { GiRollingDices } from "react-icons/gi";

interface RollChartButtonProps {
  stageId: number;
  onClick: (stageId: number) => void;
}

export function RollChartButton({ stageId, onClick }: RollChartButtonProps) {
  return (
    <IconButton 
        px={2}
        mx={1}
        variant={"surface"}
        borderWidth={2}
        size="sm"
        colorPalette="blue"
        onClick={() => onClick(stageId)}
    >
      Roll the Chart<GiRollingDices/>
    </IconButton>
  );
}