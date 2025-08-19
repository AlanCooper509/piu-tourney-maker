import { Portal, Select, createListCollection } from "@chakra-ui/react";
import type { ChartQuery } from "../../types/ChartQuery";

const chartTypes = createListCollection({
  items: [
    { label: "Single", value: "Single" },
    { label: "Double", value: "Double" },
    { label: "Co-Op", value: "Co-Op" },
    { label: "UCS", value: "UCS" },
  ],
});

interface ChartTypeSelectProps {
  value: "" | ChartQuery["type"];
  onChange: (value: "" | ChartQuery["type"]) => void;
}

// helper type guard
const isChartType = (value: string): value is ChartQuery["type"] =>
  ["Single", "Double", "Co-Op", "UCS"].includes(value);

export function ChartTypeSelect({ value, onChange }: ChartTypeSelectProps) {
  return (
    <Select.Root
      collection={chartTypes}
      size="sm"
      width="100px"
      value={value === "" ? [] : [value]}
      onValueChange={(details) => {
        const val = details.value[0] ?? "";
        if (isChartType(val) || val === "") {
          onChange(val);
        }
      }}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select type" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {chartTypes.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}