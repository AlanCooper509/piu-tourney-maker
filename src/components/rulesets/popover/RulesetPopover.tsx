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
import { CiEdit } from "react-icons/ci";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { toaster } from "../../ui/toaster";
import { handleAddChartDrawConfig } from "../../../handlers/chartdraw/handleAddChartDrawConfig";
import { handleEditChartDrawConfig } from "../../../handlers/chartdraw/handleEditChartDrawConfig";

import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";

interface RulesetPopoverProps {
  config?: ChartdrawConfigWithSpecs; // Optional: If passed, switches to Edit Mode
  setChartdrawConfigs: React.Dispatch<React.SetStateAction<ChartdrawConfigWithSpecs[]>>;
}

export function RulesetPopover({ config, setChartdrawConfigs }: RulesetPopoverProps) {
  const { tourney } = useCurrentTourney();
  const isEditMode = !!config;

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize state based on whether we have an existing config (Edit) or not (Add)
  const [name, setName] = useState(config?.name || "");
  const [containsArcade, setContainsArcade] = useState(config?.contains_arcade ?? true);
  const [containsShortcut, setContainsShortcut] = useState(config?.contains_shortcut ?? true);
  const [containsRemix, setContainsRemix] = useState(config?.contains_remix ?? true);
  const [containsFull, setContainsFull] = useState(config?.contains_full ?? true);

  const handleSave = async (e?: React.FormEvent) => {
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
      if (isEditMode && config) {
        // --- EDIT FLOW ---
        const updatedDbConfig = await handleEditChartDrawConfig(
          config.id,
          name.trim(),
          containsArcade,
          containsShortcut,
          containsRemix,
          containsFull
        );

        setChartdrawConfigs((prev) =>
          prev.map((item) =>
            item.id === config.id
              ? { ...updatedDbConfig, chartdraw_config_specs: item.chartdraw_config_specs }
              : item
          )
        );

        toaster.create({
          title: "Configuration Updated",
          description: `Successfully updated ruleset "${updatedDbConfig.name}".`,
          type: "success",
        });

      } else {
        // --- ADD FLOW ---
        if (!tourney) throw new Error("No tournament context available.");

        const newConfig = await handleAddChartDrawConfig(
          tourney.id,
          name.trim(),
          containsArcade,
          containsShortcut,
          containsRemix,
          containsFull
        );

        setChartdrawConfigs((prev) => [
          ...prev,
          { ...newConfig, chartdraw_config_specs: [] }
        ]);

        // Reset state only on Add so the form is fresh next time
        setName("");
        setContainsArcade(true);
        setContainsShortcut(true);
        setContainsRemix(true);
        setContainsFull(true);

        toaster.create({
          title: "Configuration Saved",
          description: `Successfully created layout ruleset "${newConfig.name}".`,
          type: "success",
        });
      }

      setIsOpen(false);
    } catch (err: any) {
      toaster.create({
        title: "Action Failed",
        description: err.message || "Failed to save configuration.",
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
      positioning={{ placement: isEditMode ? "bottom-end" : "bottom-start" }}
    >
      <Popover.Trigger asChild>
        {isEditMode ? (
          <IconButton aria-label="Edit ruleset" variant="outline" size="sm" colorPalette="blue">
            <CiEdit />
          </IconButton>
        ) : (
          <IconButton aria-label="Add ruleset configuration" variant="outline" borderWidth={2} px={2} size="sm" colorPalette="green">
            Add <MdOutlinePlaylistAdd />
          </IconButton>
        )}
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content p={4} w="320px" boxShadow="md">
            <Popover.Arrow />
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
                    autoFocus={!isEditMode}
                    disabled={loading}
                  />
                </Field.Root>

                {/* Content Filter Booleans (2x2 Grid) */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb={2}>Included Categories</Text>
                  <SimpleGrid columns={2} gap={3}>

                    <Switch.Root size="sm" colorPalette="teal" checked={containsArcade} onCheckedChange={(e) => setContainsArcade(e.checked)} disabled={loading}>
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="teal" variant="subtle">Arcade</Badge></Switch.Label>
                    </Switch.Root>

                    <Switch.Root size="sm" colorPalette="teal" checked={containsShortcut} onCheckedChange={(e) => setContainsShortcut(e.checked)} disabled={loading}>
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="purple" variant="subtle">Shortcut</Badge></Switch.Label>
                    </Switch.Root>

                    <Switch.Root size="sm" colorPalette="teal" checked={containsRemix} onCheckedChange={(e) => setContainsRemix(e.checked)} disabled={loading}>
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="orange" variant="subtle">Remix</Badge></Switch.Label>
                    </Switch.Root>

                    <Switch.Root size="sm" colorPalette="teal" checked={containsFull} onCheckedChange={(e) => setContainsFull(e.checked)} disabled={loading}>
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontSize="xs"><Badge colorPalette="red" variant="subtle">Full</Badge></Switch.Label>
                    </Switch.Root>

                  </SimpleGrid>
                </Box>

                {/* Actions Row */}
                <HStack justify="flex-end" pt={2} gap={2}>
                  <Button size="sm" colorPalette="gray" variant="ghost" onClick={() => setIsOpen(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" colorPalette="green" variant="outline" borderWidth={2} loading={loading} disabled={!name.trim()}>
                    {isEditMode ? "Save" : "Create"}
                  </Button>
                </HStack>

              </VStack>
            </form>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}