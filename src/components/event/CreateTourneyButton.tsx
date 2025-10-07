import { Field, IconButton, Text, Input, VStack, Select, createListCollection } from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";
import { tourneyTypes } from "../../types/Tourney";

import DialogForm from "../ui/DialogForm";
import { useState } from "react";
import DateTimeInput from "../ui/DateTimeInput/DateTimeInput";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CreateTourneyButtonProps {
  eventId: number;
}

export default function CreateTourneyButton({ eventId }: CreateTourneyButtonProps) {
  const [tourneyName, setTourneyName] = useState("");
  const [startDate, setStartDate] = useState<Value>(null);
  const [endDate, setEndDate] = useState<Value>(null);
  const [tourneyFormat, setFormTourneyFormat] = useState<string[]>([]);

  const tourneyTypeCollection = createListCollection({
    items: tourneyTypes.map(type => ({
      label: type,
      value: type,
    })),
  });

  const onStartDateChange = (val: Value) => {
    // update startDate
    setStartDate(val);

    // If endDate is before new startDate, update endDate to be same as startDate
    if (val && endDate) {
      const start = Array.isArray(val) ? val[0] : val;
      const end = Array.isArray(endDate) ? endDate[0] : endDate;
      if (end && start && end < start) {
        setEndDate(start);
      }
    }
  }

  const onEndDateChange = (val: Value) => {
    // update endDate
    setEndDate(val);

    // If startDate is after new endDate, update startDate to be same as endDate
    if (val && startDate) {
      const end = Array.isArray(val) ? val[0] : val;
      const start = Array.isArray(startDate) ? startDate[0] : startDate;
      if (end && start && start > end) {
        setStartDate(end);
      }
    }
  }

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
          value={tourneyName}
          onChange={(e) => setTourneyName(e.target.value)}
          placeholder="Enter tourney name"
        />
      </Field.Root>

      {/* Placeholder for DateTimeInput component */}
      <DateTimeInput 
        label="Tourney Start"
        value={startDate}
        onChange={onStartDateChange}
      />

      {/* Placeholder for DateTimeInput component */}
      <DateTimeInput 
        label="Tourney End"
        value={endDate}
        onChange={onEndDateChange}
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
      onSubmit={() => {
        console.log(tourneyName);
        console.log(startDate);
        console.log(endDate);
        console.log(eventId)
        console.log(tourneyFormat);
      }}
      formBody={formBody}
    />
  );
}