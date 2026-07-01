import { useState } from "react";
import {
  Button,
  Stack,
  Field,
  Input,
  createListCollection,
  HStack,
  Dialog,
  Select,
  Text,
  IconButton,
  Separator
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { toaster } from "../../ui/toaster";
import { handleAddChartSpecs } from "../../../handlers/chartdraw/handleAddChartSpecs";
import type { ChartType } from "../../../types/ChartType";

interface AddChartSpecDialogProps {
  configId: number;
}

const chartTypes = createListCollection({
  items: [
    { label: "Single", value: "Single" },
    { label: "Double", value: "Double" },
    { label: "Co-Op", value: "Co-Op" },
    { label: "UCS", value: "UCS" },
  ],
});

const chartColors: Record<string, string> = {
  "Single": "red",
  "Double": "green",
  "Co-Op": "yellow",
  "UCS": "gray",
};

const getMinLimitMessage = (type: string) => {
  if (type === "Single") return "Min level: 1";
  if (type === "Double") return "Min level: 1";
  if (type === "Co-Op") return "Range: 2-5";
  return null;
};

const getMaxLimitMessage = (type: string) => {
  if (type === "Single") return "Max level: 26";
  if (type === "Double") return "Max level: 29";
  if (type === "Co-Op") return "Range: 2-5";
  return null;
};

export default function AddChartSpecDialog({ configId }: AddChartSpecDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [chartType, setChartType] = useState<string[]>(["Single"]);
  const [minLevel, setMinLevel] = useState("10");
  const [maxLevel, setMaxLevel] = useState("10");
  const [quantity, setQuantity] = useState("1");
  const activeColor = chartColors[chartType[0]] || "gray";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const minLvl = parseInt(minLevel, 10);
      const maxLvl = parseInt(maxLevel, 10);
      const qty = parseInt(quantity, 10);

      if (minLvl > maxLvl) {
        throw new Error("Minimum level cannot be greater than maximum level.");
      }

      await handleAddChartSpecs(configId, chartType[0] as ChartType, minLvl, maxLvl, qty, null);

      toaster.create({
        title: "Specs Added",
        description: "Successfully added chart specifications.",
        type: "success",
      });

      setOpen(false);
    } catch (err: any) {
      toaster.create({
        title: "Failed to add charts",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="sm" placement="center">
      <Dialog.Trigger asChild>
        <IconButton size="xs" variant="outline" borderWidth={2} px={2} colorPalette="green" gap={1} onClick={(e) => e.stopPropagation()}>
          Add Chart Ranges<LuPlus />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>Add Charts to Draw Pool</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Stack gap={4}>

                {/* Quantity & Group Row */}
                <HStack gap={4} alignItems="end" width="100%">
                  {/* Chart Type Selection */}
                  <Field.Root required flex="9">
                    <Field.Label>Chart Type</Field.Label>
                    <Select.Root collection={chartTypes} value={chartType} onValueChange={(e) => setChartType(e.value)} positioning={{ sameWidth: true }}>
                      <Select.Trigger
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        color={`${activeColor}.600`}
                        borderColor={`${activeColor}.500`}
                        fontWeight="bold"
                      >
                        <Select.ValueText placeholder="Select type..." />
                        <Select.Indicator color={`${activeColor}.500`} />
                      </Select.Trigger>
                      <Select.Content position="absolute" zIndex={1500} mt={1} width="100%">
                        {chartTypes.items.map((type) => {
                          const itemColor = chartColors[type.value] || "gray";
                          return (
                            <Select.Item
                              item={type}
                              key={type.value}
                              color={`${itemColor}.600`}
                              _hover={{ bg: `${itemColor}.50`, color: `${itemColor}.700` }}
                              fontWeight="medium"
                            >
                              {type.label}
                            </Select.Item>
                          );
                        })}
                      </Select.Content>
                    </Select.Root>
                  </Field.Root>

                  {/* Quantity Field */}
                  <Field.Root required flex="2">
                    <Field.Label>Quantity</Field.Label>
                    <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </Field.Root>
                </HStack>

                <Separator />

                {/* Min & Max Levels Row */}
                <HStack gap={4} alignItems="end" width="100%">
                  <Field.Root required flex="1">
                    <Field.Label>Min Level</Field.Label>
                    <Input type="number" min={1} value={minLevel} onChange={(e) => setMinLevel(e.target.value)} />
                    <Text fontSize="xs" color="fg.muted">{getMinLimitMessage(chartType[0])}</Text>
                  </Field.Root>
                  <Field.Root required flex="1">
                    <Field.Label>Max Level</Field.Label>
                    <Input type="number" min={1} value={maxLevel} onChange={(e) => setMaxLevel(e.target.value)} />
                    <Text fontSize="xs" color="fg.muted">{getMaxLimitMessage(chartType[0])}</Text>
                  </Field.Root>
                </HStack>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" colorPalette="green" variant="subtle" loading={loading}>
                Add Range
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}