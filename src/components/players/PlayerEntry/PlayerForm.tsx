import { 
  VStack, 
  HStack, 
  Field, 
  Input, 
  NumberInput, 
  Button, 
  Combobox,
  type ListCollection
} from "@chakra-ui/react";

interface PlayerFormProps {
  name: string;
  setName: (val: string) => void;
  seed: string;
  setSeed: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
  loading: boolean;
  collection?: ListCollection<{ label: string; value: string }>;
  hideSeed?: boolean;
}

export function PlayerForm({
  name,
  setName,
  seed,
  setSeed,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
  collection,
  hideSeed = false
}: PlayerFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <VStack gap={4} align="stretch">
        
        {/* Name Field (Handles Combobox or Raw Input) */}
        <Field.Root>
          <Field.Label fontSize="xs">Player Name</Field.Label>
          {collection ? (
            <Combobox.Root
              collection={collection}
              inputValue={name}
              onInputValueChange={(e) => setName(e.inputValue)}
              onValueChange={(e) => setName(e.value[0] ?? "")}
              size="sm"
            >
              <Combobox.Control>
                <Combobox.Input placeholder="Select or type..." autoFocus />
                <Combobox.IndicatorGroup>
                  <Combobox.ClearTrigger />
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>
              <Combobox.Positioner>
                <Combobox.Content>
                  <Combobox.Empty>No players found</Combobox.Empty>
                  {collection.items.map((item) => (
                    <Combobox.Item key={item.value} item={item}>
                      {item.label}
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ))}
                </Combobox.Content>
              </Combobox.Positioner>
            </Combobox.Root>
          ) : (
            <Input
              size="sm"
              placeholder="e.g. TUSA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          )}
        </Field.Root>

        {/* Seed Field */}
        {!hideSeed && (
          <Field.Root>
            <Field.Label fontSize="xs">Seed Placement (Optional)</Field.Label>
            <NumberInput.Root
              size="sm"
              value={seed}
              onValueChange={(e) => setSeed(e.value)}
            >
              <NumberInput.Input placeholder="Leave blank for unseeded" />
            </NumberInput.Root>
          </Field.Root>
        )}

        {/* Actions Row */}
        <HStack justify="flex-end" pt={2} gap={2}>
          <Button
            size="sm"
            colorPalette="red"
            variant="outline"
            borderWidth={2}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            colorPalette="green"
            variant="outline"
            borderWidth={2}
            loading={loading}
            disabled={!name.trim()}
          >
            {submitLabel}
          </Button>
        </HStack>

      </VStack>
    </form>
  );
}