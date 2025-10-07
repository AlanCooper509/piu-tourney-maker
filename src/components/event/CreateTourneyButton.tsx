import { Field, IconButton, Text, Input, VStack, Select, createListCollection } from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";
import { tourneyTypes } from "../../types/Tourney";

import DialogForm from "../ui/DialogForm";
import { useState } from "react";
import DateTimeInput from "../ui/DateTimeInput";

interface CreateTourneyButtonProps {
  eventId: number;
}

export default function CreateTourneyButton({ eventId }: CreateTourneyButtonProps) {
  const [formTourneyName, setFormTourneyName] = useState("");
  const [tourneyFormat, setFormTourneyFormat] = useState<string[]>([]);

  console.log(formTourneyName);
  console.log(tourneyFormat);

  const tourneyTypeCollection = createListCollection({
    items: tourneyTypes.map(type => ({
      label: type,
      value: type,
    })),
  });

  const trigger = (
    <IconButton
      aria-label="Add to Pool"
      size="sm"
      variant="outline"
      borderWidth={2}
      colorPalette="green"
      px={2}
      ml={4}
      mt={2}
      onClick={() => { }}
    >
      <Text fontSize={"md"}>Create New Tourney</Text><IoAddCircleSharp />
    </IconButton>
  );

  const formBody = (
    <VStack gap={4} align="stretch">
      {/* Tourney Name Input */}
      <Field.Root>
        <Field.Label>Tourney Name</Field.Label>
        <Input
          value={formTourneyName}
          onChange={(e) => setFormTourneyName(e.target.value)}
          placeholder="Enter tourney name"
        />
      </Field.Root>

      {/* Placeholder for DateTimeInput component */}
      <DateTimeInput 
        label="Start Date & Time (NYI)"
      />

      {/* Placeholder for DateTimeInput component */}
      <DateTimeInput 
        label="End Date & Time (NYI)"
      />

      {/* Tourney Type Selector */}
      <Field.Root>
        <Select.Root
          collection={tourneyTypeCollection}
          defaultValue={[]}
          onValueChange={({ value }) => setFormTourneyFormat(value)}
          size="sm" 
        >
          <Select.HiddenSelect />
          <Select.Label>Tourney Format</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Choose format" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.ClearTrigger />
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {tourneyTypeCollection.items.map((tourneyType) => (
                <Select.Item item={tourneyType} key={tourneyType.value}>
                  {tourneyType.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>
    </VStack>
  )

  return (
    <DialogForm
      title="Create New Tourney"
      trigger={trigger}
      onSubmit={() => {console.log(eventId)}}
      formBody={formBody}
    />
  );
}