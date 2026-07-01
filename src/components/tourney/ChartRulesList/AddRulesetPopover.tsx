import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Portal,
  VStack,
  HStack,
  Field,
  Input,
  SimpleGrid,
  Switch,
  Text,
  Badge
} from "@chakra-ui/react";
import { MdOutlinePlaylistAdd } from "react-icons/md";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { toaster } from "../../ui/toaster";
import { handleAddChartDrawConfig } from "../../../handlers/chartdraw/handleAddChartDrawConfig";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";

interface AddRulesetPopoverProps {
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
}

export function AddRulesetPopover({ setChartdrawConfigs }: AddRulesetPopoverProps) {
  const { tourney } = useCurrentTourney();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  // Isolated form state matching DB requirements (booleans default to true per SQL schema)
  const [name, setName] = useState("");
  const [containsArcade, setContainsArcade] = useState(true);
  const [containsShortcut, setContainsShortcut] = useState(true);
  const [containsRemix, setContainsRemix] = useState(true);
  const [containsFull, setContainsFull] = useState(true);

  const handleSave = async (e?: React.FormEvent) => {
    if (!tourney) {
      toaster.create({
        title: "Action Failed",
        description: "No tournament context available.",
        type: "error",
      });
      return;
    }
    if (e) e.preventDefault();

    if (!name.trim()) {
      toaster.create({
        title: "Validation Error",
        description: "Please provide a valid ruleset configuration name.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {

      // db write
      const newConfig = await handleAddChartDrawConfig(
        tourney?.id,
        name.trim(),
        containsArcade,
        containsShortcut,
        containsRemix,
        containsFull
      );

      // push directly to local state before realtime update arrives
      setChartdrawConfigs((prev) => [
        ...prev,
        {
          ...newConfig,
          chartdraw_config_specs: []
        }
      ]);

      // reset states
      setName("");
      setContainsArcade(true);
      setContainsShortcut(true);
      setContainsRemix(true);
      setContainsFull(true);
      setIsOpen(false);

      toaster.create({
        title: "Configuration Saved",
        description: `Successfully created layout ruleset "${newConfig.name}".`,
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Action Failed",
        description: err.message || "Failed to save configuration ruleset.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{ placement: "bottom-start" }}
    >
      <Popover.Trigger asChild>
        <IconButton
          aria-label="Add ruleset configuration"
          variant="outline"
          borderWidth={2}
          px={2}
          size="sm"
          colorPalette="green"
        >
          Add <MdOutlinePlaylistAdd />
        </IconButton>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content p={4} w="320px" boxShadow="md">
            <Popover.Arrow />

            {/* Embedded RulesetForm */}
            <form onSubmit={handleSave}>
              <VStack gap={4} align="stretch">

                {/* Ruleset Configuration Name */}
                <Field.Root>
                  <Field.Label fontSize="xs" fontWeight="bold">Ruleset Name</Field.Label>
                  <Input
                    size="sm"
                    placeholder="e.g. WR1 Ruleset"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    disabled={loading}
                  />
                </Field.Root>

                {/* Content Filter Booleans (2x2 Grid) */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb={2}>
                    Included Categories
                  </Text>
                  <SimpleGrid columns={2} gap={3}>

                    <Switch.Root
                      size="sm"
                      colorPalette="green"
                      checked={containsArcade}
                      onCheckedChange={(e) => setContainsArcade(e.checked)}
                      disabled={loading}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="teal" variant="subtle">Arcade</Badge></Switch.Label>
                    </Switch.Root>

                    <Switch.Root
                      size="sm"
                      colorPalette="green"
                      checked={containsShortcut}
                      onCheckedChange={(e) => setContainsShortcut(e.checked)}
                      disabled={loading}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="purple" variant="subtle">Shortcut</Badge></Switch.Label>
                    </Switch.Root>

                    <Switch.Root
                      size="sm"
                      colorPalette="green"
                      checked={containsRemix}
                      onCheckedChange={(e) => setContainsRemix(e.checked)}
                      disabled={loading}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="orange" variant="subtle">Remix</Badge></Switch.Label>
                    </Switch.Root>

                    <Switch.Root
                      size="sm"
                      colorPalette="green"
                      checked={containsFull}
                      onCheckedChange={(e) => setContainsFull(e.checked)}
                      disabled={loading}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="red" variant="subtle">Full</Badge></Switch.Label>
                    </Switch.Root>

                  </SimpleGrid>
                </Box>

                {/* Actions Row */}
                <HStack justify="flex-end" pt={2} gap={2}>
                  <Button
                    size="sm"
                    colorPalette="red"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
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
                    Create
                  </Button>
                </HStack>

              </VStack>
            </form>

          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};