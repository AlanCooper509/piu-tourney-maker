import { Portal, Select, createListCollection } from "@chakra-ui/react";

interface ChartTypeLevelSelectProps {
  value: "" | { type: string; level: number };
  onChange: (value: "" | { type: string; level: number }) => void;
  options: { type: string; level: number }[]; // dynamic options
}

export function ChartTypeLevelSelect({ value, onChange, options }: ChartTypeLevelSelectProps) {
  // create the collection dynamically based on options
  const collection = createListCollection({
    items: options.map((opt) => ({
      label: `${opt.type} ${opt.level}`,
      value: JSON.stringify(opt), // serialize object for Select
    })),
  });

  return (
    <Select.Root
      collection={collection}
      size="sm"
      width="140px"
      value={value === "" ? [] : [JSON.stringify(value)]}
      onValueChange={(details) => {
        const val = details.value[0];
        if (!val) return onChange("");
        try {
          onChange(JSON.parse(val));
        } catch {
          onChange("");
        }
      }}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Type / Lv." />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
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