import { Field, IconButton, Text, Input, VStack, Select, createListCollection } from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";

import onSubmitHandler from "./onSubmitHandler";
import DialogForm from "../../ui/DialogForm";
import { useState } from "react";
import DateTimeInput from "../../ui/DateTimeInput/DateTimeInput";
import { useAdminTourneyContext } from "../../../context/admin/AdminTourneyContext";

import { tourneyTypes, type Tourney } from "../../../types/Tourney";
import type { Game } from "../../../types/Game";

interface CreateTourneyButtonProps {
  eventId: number;
  setTourneys: React.Dispatch<React.SetStateAction<Tourney[]>>;
  gameData: Game[] | null;
}

export default function CreateTourneyButton({ 
  eventId, 
  setTourneys, 
  gameData 
}: CreateTourneyButtonProps) {
  const [open, setOpen] = useState(false);
  const [tourneyName, setTourneyName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tourneyFormat, setFormTourneyFormat] = useState<string[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string[]>([]);

  const { addTourneyAdminId } = useAdminTourneyContext();

  const tourneyTypeCollection = createListCollection({
    items: tourneyTypes.map((type) => ({
      label: type,
      value: type,
    })),
  });

  const gamesCollection = createListCollection({
    items: (gameData ?? []).map((game) => ({
      label: game.name,
      value: game.id.toString(),
    })),
  });

  const onStartDateChange = (val: Date | null) => {
    setStartDate(val);

    if (val && endDate) {
      const start = Array.isArray(val) ? val[0] : val;
      const end = Array.isArray(endDate) ? endDate[0] : endDate;
      if (end && start && end < start) {
        setEndDate(start);
      }
    }
  };

  const onEndDateChange = (val: Date | null) => {
    setEndDate(val);

    if (val && startDate) {
      const end = Array.isArray(val) ? val[0] : val;
      const start = Array.isArray(startDate) ? startDate[0] : startDate;
      if (end && start && start > end) {
        setStartDate(end);
      }
    }
  };

  const button = (
    <IconButton
      aria-label="Add to Pool"
      size="sm"
      variant="outline"
      borderWidth={2}
      colorPalette="green"
      px={2}
      ml={4}
      mt={2}
      onClick={() => {}}
    >
      <Text fontSize={"md"}>Create New Tourney</Text>
      <IoAddCircleSharp />
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

      {/* Game Selector */}
      <Field.Root>
        <Select.Root
          collection={gamesCollection}
          value={selectedGameId}
          onValueChange={({ value }) => setSelectedGameId(value)}
          size="sm"
        >
          <Select.HiddenSelect />
          <Select.Label>Game</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select game" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.ClearTrigger />
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {gamesCollection.items.map((game) => (
                <Select.Item item={game} key={game.value}>
                  {game.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      {/* Start DateTimeInput component */}
      <DateTimeInput
        label="Tourney Start"
        value={startDate}
        onChange={onStartDateChange}
      />

      {/* End DateTimeInput component */}
      <DateTimeInput
        label="Tourney End"
        value={endDate}
        onChange={onEndDateChange}
      />

      {/* Tourney Type Selector */}
      <Field.Root>
        <Select.Root
          collection={tourneyTypeCollection}
          value={tourneyFormat}
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
  );

  function resetForm() {
    setTourneyName("");
    setStartDate(null);
    setEndDate(null);
    setFormTourneyFormat([]);
    setSelectedGameId([]);
  }

  return (
    <DialogForm
      title="Create New Tourney"
      trigger={button}
      formBody={formBody}
      open={open}
      setOpen={setOpen}
      onSubmit={async () => {
        const gameId = selectedGameId.length > 0 ? Number(selectedGameId[0]) : null;
        return onSubmitHandler({
          tourneyName,
          startDate,
          endDate,
          eventId,
          tourneyFormat,
          gameId,
          resetForm,
          setTourneys,
          addTourneyAdminId,
        });
      }}
      onCancel={resetForm}
    />
  );
}