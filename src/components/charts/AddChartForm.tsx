import { useState, useMemo } from "react";
import {
  Combobox,
  HStack,
  IconButton,
  useFilter,
  useListCollection,
  Portal,
} from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";

import { toaster } from "../ui/toaster";
import type { ChartQuery } from "../../types/ChartQuery";
import chartsData from "../../data/charts-v2_11_0.json";
import { ChartTypeLevelSelect } from "./ChartOptionsSelect";

interface AddChartFormProps {
  onSubmit: (chartQuery: ChartQuery) => Promise<void>;
}

export default function AddChartForm({ onSubmit }: AddChartFormProps) {
  const [chartName, setChartName] = useState("");
  const [chartLevel, setChartLevel] = useState<number | "">("");
  const [chartType, setChartType] = useState<ChartQuery["type"] | "">("");

  // combobox options for chart names (unique)
  const songOptions = useMemo(() => {
    const unique = Array.from(
      new Map(
        chartsData.map((chart: any) => [
          chart.name_en,
          { label: chart.name_en, value: chart.name_en },
        ])
      ).values()
    );
    unique.sort((a, b) => a.label.localeCompare(b.label));
    return unique;
  }, []);

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter, reset: resetInput } = useListCollection({
    initialItems: songOptions,
    filter: contains,
  });

  // chart type and difficulty for a specified chartName
  const typeLevelOptions = useMemo(() => {
    if (!chartName) return [];
    
    return chartsData
      .filter((chart) => chart.name_en === chartName)
      .map((chart) => ({
        type: chart.type,
        level: Number(chart.level),
      }))
      .sort((a, b) => {
        const typeDiff = typeOrder[a.type] - typeOrder[b.type];
        if (typeDiff !== 0) return typeDiff;
        return a.level - b.level;
      });
  }, [chartName]);

  const handleSubmit = async () => {
    if (!chartName || !chartType || chartLevel === "") {
      toaster.create({
        title: "Error Adding Chart",
        description: "Please ensure all fields are correct.",
        type: "error",
        closable: true,
      });
      return;
    }

    await onSubmit({ name: chartName, type: chartType, level: Number(chartLevel) });

    // clear inputs
    setChartName("");
    setChartType("");
    setChartLevel("");
    resetInput();
  };

  return (
    <HStack my={2} gap={2} alignContent="center" justifyContent="center" borderRadius="md">
      {/* Chart name Combobox */}
      <Combobox.Root
        collection={collection}
        onInputValueChange={(e) => filter(e.inputValue)}
        onValueChange={(e) => setChartName(e.value[0] ?? "")}
        width="180px"
        size="sm"
      >
        <Combobox.Control>
          <Combobox.Input placeholder="Chart Name" />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.Empty>No charts found</Combobox.Empty>
              {collection.items.map((item) => (
                <Combobox.Item
                  key={item.value}
                  item={item}
                >
                  {item.label}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>

      {/* Chart type & level select */}
      <ChartTypeLevelSelect
        value={chartType && chartLevel !== "" ? { type: chartType, level: chartLevel } : ""}
        onChange={(val) => {
          if (val === "") {
            setChartType("");
            setChartLevel("");
          } else if (isChartType(val.type)) {
            setChartType(val.type);
            setChartLevel(Number(val.level));
          }
        }}
        options={typeLevelOptions}
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

const typeOrder: Record<string, number> = {
  "Single": 0,
  "Double": 1,
  "Co-Op": 2,
  "UCS": 3, // (if ever included)
};

// helper type guard
const chartTypes = ["Single", "Double", "Co-Op", "UCS"] as const;
const isChartType = (value: string): value is ChartQuery["type"] =>
  chartTypes.includes(value as any);