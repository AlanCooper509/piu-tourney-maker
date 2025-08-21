import { useState } from "react";
import { HStack, Input, IconButton } from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";
import { ChartTypeSelect } from "./ChartTypeSelect";
import { toaster } from "../ui/toaster";
import type { ChartQuery } from "../../types/ChartQuery";

interface AddChartFormProps {
  onSubmit: (chartQuery: ChartQuery) => Promise<void>;
}

export default function AddChartForm({ onSubmit }: AddChartFormProps) {
  const [chartName, setChartName] = useState("");
  const [chartLevel, setChartLevel] = useState<number | "">("");
  const [chartType, setChartType] = useState<ChartQuery["type"] | "">("");

  const handleSubmit = () => {
    if (chartName && chartLevel && chartType) {
      onSubmit({ name: chartName, level: Number(chartLevel), type: chartType });
    } else {
      setChartLevel(""); // not sure why this field persists on UI when submitting successfully
      toaster.create({
        title: "Error Adding Chart",
        description: "Please ensure all fields are correct.",
        type: "error",
        closable: true,
      });
    };
    setChartName("");
    setChartType("");
  };

  return (
    <HStack my={2} gap={2} alignContent="center" justifyContent="center" borderRadius="md">
      {/* Chart name */}
      <Input
        size="sm"
        placeholder="Chart Name"
        value={chartName}
        onChange={(e) => setChartName(e.target.value)}
        width="180px"
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
        maxWidth={"60px"}
      />

      {/* Submit button */}
      <IconButton
        aria-label="Add to Pool"
        size="sm"
        variant="outline"
        borderWidth={2}
        colorPalette="green"
        px={2}
        onClick={handleSubmit}
      >
        Add to Pool <IoAddCircleSharp />
      </IconButton>
    </HStack>
  );
}
