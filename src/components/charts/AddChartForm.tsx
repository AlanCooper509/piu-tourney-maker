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
import { CHART_SOURCE_BY_GAME_ID } from "../../data/charts";

import { toaster } from "../ui/toaster";
import { ChartTypeLevelSelect } from "./ChartOptionsSelect";
import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { smxDiffClassAbbr } from "../../helpers/chartSnapshot";

import type { ChartQuery } from "../../types/ChartQuery";
import type { ChartType } from "../../types/ChartType";
import type { SmxChart } from "../../types/SmxChart";

interface AddChartFormProps {
  onSubmit: (chartQuery: ChartQuery) => Promise<void>;
}

// JSON-encoded rather than a delimited string, since artist names can
// themselves contain arbitrary characters (e.g. "Eagle | Stallian").
const smxSongKey = (chart: SmxChart) => JSON.stringify([chart.name, chart.artist]);

const SMX_DIFF_ORDER: Record<string, number> = {
  beginner: 0,
  easy: 1,
  hard: 2,
  wild: 3,
  dual: 4,
  full: 5,
  team: 6,
};

// diffClass alone isn't always a unique key per song+level (a flagged alt
// chart, e.g. a "plus" pack variant, can share both) - fold flags into the
// type value passed through ChartTypeLevelSelect so selection stays unambiguous.
const smxTypeKey = (diffClass: string, flags: string[]) =>
  flags.length ? `${diffClass}::${flags.join(",")}` : diffClass;

export default function AddChartForm({ onSubmit }: AddChartFormProps) {
  const { tourney } = useCurrentTourney();
  const [chartName, setChartName] = useState("");
  const [chartLevel, setChartLevel] = useState<number | "">("");
  const [chartType, setChartType] = useState<string>("");
  // Bumping this key remounts it, which is the reliable way to actually
  // clear the visible search box after a submit.
  const [comboboxResetKey, setComboboxResetKey] = useState(0);

  // 1. Resolve dataset based on active gameId
  const chartSource = useMemo(() => {
    if (!tourney) return null;
    return CHART_SOURCE_BY_GAME_ID[tourney.game_id] ?? null;
  }, [tourney]);

  // 2. Extract unique song names for the Combobox
  const songOptions = useMemo(() => {
    if (!chartSource) return [];

    let unique;
    if (chartSource.kind === "piu") {
      unique = Array.from(
        new Map(
          chartSource.charts.map((chart) => [
            chart.name_en,
            { label: chart.name_en, value: chart.name_en },
          ])
        ).values()
      );
    } else {
      const artistsByName = new Map<string, Set<string>>();
      chartSource.charts.forEach((chart) => {
        if (!artistsByName.has(chart.name)) artistsByName.set(chart.name, new Set());
        artistsByName.get(chart.name)!.add(chart.artist);
      });

      unique = Array.from(
        new Map(
          chartSource.charts.map((chart) => [
            smxSongKey(chart),
            {
              label: (artistsByName.get(chart.name)?.size ?? 0) > 1
                ? `${chart.name} (${chart.artist})`
                : chart.name,
              value: smxSongKey(chart),
            },
          ])
        ).values()
      );
    }
    unique.sort((a, b) => a.label.localeCompare(b.label));
    return unique;
  }, [chartSource]);

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
    setComboboxResetKey((k) => k + 1);
  }, [tourney?.game_id, resetInput]);

  // 3. Filter types and levels for the selected chartName
  const typeLevelOptions = useMemo(() => {
    if (!chartName || !chartSource) return [];

    if (chartSource.kind === "piu") {
      return chartSource.charts
        .filter((chart): chart is typeof chart & { type: ChartType } =>
          chart.name_en === chartName && chart.type !== null
        )
        .map((chart) => ({
          type: chart.type as string,
          level: Number(chart.level),
        }))
        .sort((a, b) => {
          const typeDiff = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
          if (typeDiff !== 0) return typeDiff;
          return a.level - b.level;
        });
    }

    return chartSource.charts
      .filter((chart) => smxSongKey(chart) === chartName)
      .sort((a, b) => {
        const diffOrder = (SMX_DIFF_ORDER[a.diffClass] ?? 99) - (SMX_DIFF_ORDER[b.diffClass] ?? 99);
        if (diffOrder !== 0) return diffOrder;
        return a.level - b.level;
      })
      .map((chart) => ({
        type: smxTypeKey(chart.diffClass, chart.flags),
        level: chart.level,
        label: `${smxDiffClassAbbr(chart.diffClass)}${chart.level}${chart.flags.includes("plus") ? "+" : ""}`,
      }));
  }, [chartName, chartSource]);

  const handleSubmit = async () => {
    if (!chartName || !chartType || chartLevel === "" || !chartSource) {
      toaster.create({
        title: "Error Adding Chart",
        description: "Please ensure all fields are correct.",
        type: "error",
        closable: true,
      });
      return;
    }

    if (chartSource.kind === "piu") {
      if (!isChartType(chartType)) return;
      await onSubmit({ kind: "piu", name: chartName, type: chartType, level: Number(chartLevel) });
    } else {
      const match = chartSource.charts.find(
        (chart) =>
          smxSongKey(chart) === chartName &&
          smxTypeKey(chart.diffClass, chart.flags) === chartType &&
          chart.level === chartLevel
      );
      if (!match) {
        toaster.create({
          title: "Error Adding Chart",
          description: "Could not find the selected SMX chart.",
          type: "error",
          closable: true,
        });
        return;
      }
      await onSubmit({
        kind: "smx",
        name: match.name,
        artist: match.artist,
        bpm: match.bpm,
        image_url: match.image_url,
        style: match.style,
        diffClass: match.diffClass,
        level: match.level,
        flags: match.flags,
      });
    }

    // clear inputs
    setChartName("");
    setChartType("");
    setChartLevel("");
    resetInput();
    setComboboxResetKey((k) => k + 1);
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
        key={comboboxResetKey}
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
            return;
          }
          if (chartSource?.kind === "piu" && !isChartType(val.type)) return;
          setChartType(val.type);
          setChartLevel(Number(val.level));
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
type PiuChartType = (typeof chartTypes)[number];
const isChartType = (value: string): value is PiuChartType =>
  chartTypes.includes(value as any);