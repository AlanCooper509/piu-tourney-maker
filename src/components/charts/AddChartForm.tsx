import { useState } from "react";
import {HStack, Input, IconButton} from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";
import { ChartTypeSelect } from "./ChartTypeSelect";

export type ChartQuery = {
  name: string;
  level: number;
  type: 'Single' | 'Double' | 'Co-Op' | 'UCS';
};

interface AddChartFormProps {
  onSubmit: (chartQuery: ChartQuery) => Promise<void>;
}

export default function AddChartForm({ onSubmit }: AddChartFormProps) {
  const [chartName, setChartName] = useState("");
  const [chartLevel, setChartLevel] = useState<number | "">("");
  const [chartType, setChartType] = useState<ChartQuery["type"] | "">("");

  const handleSubmit = () => {
    if (!chartName || !chartLevel || !chartType) return;
    onSubmit({ name: chartName, level: Number(chartLevel), type: chartType });
    setChartName("");
    setChartLevel("");
    setChartType("");
  };

  return (
    <HStack mt={2} gap={2} alignContent="center" justifyContent="center">
      {/* Chart name */}
      <Input
        size="sm"
        placeholder="Chart Name (e.g. Halcyon)"
        value={chartName}
        onChange={(e) => setChartName(e.target.value)}
        width="200px"
      />

      {/* Chart type select */}
      <ChartTypeSelect value={chartType} onChange={setChartType} />

      {/* Chart level input */}
      <Input
        type="number"
        value={chartLevel !== "" ? chartLevel.toString() : undefined}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value >= 1) {
            setChartLevel(value);
          }
        }}
        placeholder="Lv."
        min={1}
        max={28}
        maxWidth={"80px"}
      />

      {/* Submit button */}
      <IconButton
        aria-label="Add to Pool"
        size="sm"
        colorPalette="green"
        px={2}
        onClick={handleSubmit}
      >
        Add to Pool <IoAddCircleSharp />
      </IconButton>
    </HStack>
  );
}