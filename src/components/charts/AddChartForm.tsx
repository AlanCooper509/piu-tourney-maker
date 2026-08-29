import { useState, useMemo, useEffect } from "react";
import {
  useBreakpointValue,
  Combobox,
  HStack,
  IconButton,
  useFilter,
  useListCollection,
  Portal
} from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";
import { CHARTS_BY_GAME_ID } from "../../data/charts";

import { toaster } from "../ui/toaster";
import { ChartTypeLevelSelect } from "./ChartOptionsSelect";
import { useCurrentTourney } from "../../context/CurrentTourneyContext";

import type { ChartQuery } from "../../types/ChartQuery";

interface AddChartFormProps {
  onSubmit: (chartQuery: ChartQuery) => Promise<void>;
}

export default function AddChartForm({ onSubmit }: AddChartFormProps) {
  const { tourney } = useCurrentTourney();
  const [chartName, setChartName] = useState("");
  const [chartLevel, setChartLevel] = useState<number | "">("");
  const [chartType, setChartType] = useState<ChartQuery["type"] | "">("");

  // 1. Resolve dataset based on active gameId
  const chartsData = useMemo(() => {
    if (!tourney) return [];
    return CHARTS_BY_GAME_ID[tourney.game_id] ?? [];
  }, [tourney]);

  // 2. Extract unique song names for the Combobox
  const songOptions = useMemo(() => {
    const unique = Array.from(
      new Map(
        chartsData.map((chart) => [
          chart.name_en,
          { label: chart.name_en, value: chart.name_en },
        ])
      ).values()
    );
    unique.sort((a, b) => a.label.localeCompare(b.label));
    return unique;
  }, [chartsData]);

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter, reset: resetInput } = useListCollection({
    initialItems: songOptions,
    filter: contains,
  });

  // Reset form selections if the gameId changes
  useEffect(() => {
    setChartName("");
    setChartType("");
    setChartLevel("");
    resetInput();
  }, [tourney?.game_id, resetInput]);

  // 3. Filter types and levels for the selected chartName
  const typeLevelOptions = useMemo(() => {
    if (!chartName) return [];

    return chartsData
      .filter((chart): chart is typeof chart & { type: ChartQuery["type"] } =>
        chart.name_en === chartName && chart.type !== null
      )
      .map((chart) => ({
        type: chart.type,
        level: Number(chart.level),
      }))
      .sort((a, b) => {
        const typeDiff = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
        if (typeDiff !== 0) return typeDiff;
        return a.level - b.level;
      });
  }, [chartName, chartsData]);

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

  const submitLabel = useBreakpointValue({
    base: "",       // icon only
    sm: "Add",      // small -> just "Add"
    md: "Add to Pool", // medium+ -> full text
  });

  return (
    <HStack my={2} gap={2} alignContent="center" justifyContent="center" borderRadius="md">
      {/* Chart name Combobox */}
      <Combobox.Root
        collection={collection}
        onInputValueChange={(e) => filter(e.inputValue)}
        onValueChange={(e) => setChartName(e.value[0] ?? "")}
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
                  fontSize="sm"
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
        {submitLabel}
        <IoAddCircleSharp />
      </IconButton>
    </HStack>
  );
}

const typeOrder: Record<string, number> = {
  "Single": 0,
  "Double": 1,
  "Co-Op": 2,
  "UCS": 3,
};

// helper type guard
const chartTypes = ["Single", "Double", "Co-Op", "UCS"] as const;
const isChartType = (value: string): value is ChartQuery["type"] =>
  chartTypes.includes(value as any);