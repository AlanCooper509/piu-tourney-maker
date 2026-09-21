import { Portal, Select, createListCollection } from "@chakra-ui/react";

interface ChartTypeLevelSelectProps {
  value: "" | { type: string; level: number };
  onChange: (value: "" | { type: string; level: number }) => void;
  options: { type: string; level: number; label?: string }[]; // dynamic options
}

// Identity for the Select's own value matching - deliberately just
// {type, level}, not the whole option, so an extra presentational field
// (like `label`) can't make an option's serialized value stop matching the
// controlled `value` prop (which only ever carries type/level).
const identity = (opt: { type: string; level: number }) =>
  JSON.stringify({ type: opt.type, level: opt.level });

export function ChartTypeLevelSelect({ value, onChange, options }: ChartTypeLevelSelectProps) {
  // create the collection dynamically based on options
  const collection = createListCollection({
    items: options.map((opt) => ({
      label: opt.label ?? `${opt.type[0]}${opt.level}`,
      value: identity(opt),
    })),
  });

  return (
    <Select.Root
      collection={collection}
      size="sm"
      width="120px"
      value={value === "" ? [] : [identity(value)]}
      onValueChange={(details) => {
        const val = details.value[0];
        if (!val) return onChange("");
        try {
          const parsed = JSON.parse(val);
          onChange({ type: parsed.type, level: parsed.level });
        } catch {
          onChange("");
        }
      }}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger fontSize="xs">
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
              <Select.Item key={item.value} item={item} fontSize="sm">
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