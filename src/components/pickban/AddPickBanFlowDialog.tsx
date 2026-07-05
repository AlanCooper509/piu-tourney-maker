import { useState, useRef, useEffect } from "react";
import {
  Button,
  Stack,
  HStack,
  Dialog,
  Text,
  IconButton,
  Separator,
  Box,
  VStack,
  Input
} from "@chakra-ui/react";
import { LuPlus, LuTrash2, LuArrowRight } from "react-icons/lu";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoBan } from "react-icons/io5";
import { MdShield } from "react-icons/md";
import { toaster } from "../ui/toaster";
import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { handleAddPickBanFlow } from "../../handlers/pickban/handleAddPickBanFlow";
import type { PickbanAction, PickbanActor } from "../../types/Pickban";

interface AddPickBanFlowDialogProps {
  configId: number;
  totalCharts?: number;
}

interface SequenceStepInput {
  action: PickbanAction;
  actor: NonNullable<PickbanActor>;
}

const actionColors: Record<SequenceStepInput["action"], string> = {
  PICK: "green",
  BAN: "red",
  PROTECT: "blue",
  AUTOPICK: "teal",
  IGNORE: "orange",
};

const actorColors: Record<SequenceStepInput["actor"], string> = {
  "Higher Seed": "red",
  "Lower Seed": "blue",
  "Automation": "teal",
};

export default function AddPickBanFlowDialog({ configId, totalCharts }: AddPickBanFlowDialogProps) {
  const { tourney } = useCurrentTourney();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<SequenceStepInput[]>([]);
  const [rulesetName, setRulesetName] = useState(""); // State tracked for the database name column

  const timelineBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (steps.length > 0) {
      timelineBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [steps.length]);

  const currentCharts = steps.reduce((total, step) => {
    if (step.action === "PICK" || step.action === "BAN" || step.action === "AUTOPICK" || step.action === "IGNORE") {
      return total + 1;
    }
    return total;
  }, 0);

  const selectedCharts = steps.reduce((total, step) => {
    if (step.action === "PICK" || step.action === "AUTOPICK") {
      return total + 1;
    }
    return total;
  }, 0);

  const handleInstantAddStep = (action: SequenceStepInput["action"], actor: SequenceStepInput["actor"]) => {
    setSteps((prev) => [...prev, { action, actor }]);
  };

  const handleRemoveStep = (indexToRemove: number) => {
    setSteps((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const resetForm = () => {
    setSteps([]);
    setRulesetName("");
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourney) return;
    if (!rulesetName.trim()) {
      toaster.create({
        title: "Validation Error",
        description: "No name was provided for this configuration ruleset.",
        type: "error",
      });
      return;
    }
    if (steps.length === 0) {
      toaster.create({
        title: "Validation Error",
        description: "There are no steps in this pick/ban sequence timeline.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await handleAddPickBanFlow(tourney.id, rulesetName, steps, configId);

      toaster.create({
        title: "Ruleset Flow Saved",
        description: `Successfully configured "${rulesetName}" with ${steps.length} sequential actions.`,
        type: "success",
      });

      resetForm();
    } catch (err: any) {
      toaster.create({
        title: "Failed to apply workflow",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="md" placement="center">
      <Dialog.Trigger asChild>
        <Button size="xs" variant="outline" flex={1} borderWidth={2} px={2} py={2} colorPalette="green" gap={1} onClick={(e) => e.stopPropagation()}>
          Create New Pick/Ban Flow <LuPlus />
        </Button>
      </Dialog.Trigger>

      <Dialog.Backdrop />

      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>Build New Pick/Ban Flow Sequence</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger />

            <Dialog.Body>
              <Stack gap={4}>

                {/* New Ruleset Profile Info Input */}
                <Stack gap={1.5}>
                  <Text fontSize="xs" fontWeight="bold" color="fg.subtle">
                    Ruleset Flow Name <Box as="span" color="red.500">*</Box>
                  </Text>
                  <Input
                    placeholder="e.g., 11 Draws Bo3"
                    size="sm"
                    value={rulesetName}
                    onChange={(e) => setRulesetName(e.target.value)}
                    required
                    maxLength={100}
                    variant="flushed"
                    px={1}
                    borderColor="green.500"
                  />
                </Stack>

                <Separator />

                {/* Buttons for Building Pick/Ban Sequence */}
                <Stack gap={3} p={3} bg="bg.muted" borderRadius="md" borderWidth="1px" width="100%">
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="fg.muted">
                    build timeline sequence
                  </Text>

                  <Stack gap={2.5}>
                    {/* Higher Seed Actions */}
                    <HStack gap={2} width="100%">
                      <Text fontSize="xs" fontWeight="bold" w="85px" color="red.600" flexShrink={0}>
                        Higher Seed:
                      </Text>
                      <Button size="xs" variant="outline" colorPalette="green" flex="1" onClick={() => handleInstantAddStep("PICK", "Higher Seed")}>
                        <FaRegCheckCircle /> PICK
                      </Button>
                      <Button size="xs" variant="outline" colorPalette="red" flex="1" onClick={() => handleInstantAddStep("BAN", "Higher Seed")}>
                        <IoBan /> BAN
                      </Button>
                      <Button size="xs" variant="outline" colorPalette="blue" flex="1" onClick={() => handleInstantAddStep("PROTECT", "Higher Seed")}>
                        <MdShield /> PROTECT
                      </Button>
                    </HStack>

                    {/* Lower Seed Actions */}
                    <HStack gap={2} width="100%">
                      <Text fontSize="xs" fontWeight="bold" w="85px" color="blue.600" flexShrink={0}>
                        Lower Seed:
                      </Text>
                      <Button size="xs" variant="outline" colorPalette="green" flex="1" onClick={() => handleInstantAddStep("PICK", "Lower Seed")}>
                        <FaRegCheckCircle /> PICK
                      </Button>
                      <Button size="xs" variant="outline" colorPalette="red" flex="1" onClick={() => handleInstantAddStep("BAN", "Lower Seed")}>
                        <IoBan /> BAN
                      </Button>
                      <Button size="xs" variant="outline" colorPalette="blue" flex="1" onClick={() => handleInstantAddStep("PROTECT", "Lower Seed")}>
                        <MdShield /> PROTECT
                      </Button>
                    </HStack>

                    <Separator my={0.5} />

                    {/* System Automation Actions */}
                    <HStack gap={2} width="100%">
                      <Text fontSize="xs" fontWeight="bold" w="85px" color="teal.600" flexShrink={0}>
                        Automation:
                      </Text>
                      <Button size="xs" variant="outline" colorPalette="teal" flex="1" onClick={() => handleInstantAddStep("AUTOPICK", "Automation")}>
                        AUTOPICK
                      </Button>
                      <Button size="xs" variant="outline" colorPalette="orange" flex="1" onClick={() => handleInstantAddStep("IGNORE", "Automation")}>
                        IGNORE
                      </Button>
                    </HStack>
                  </Stack>
                </Stack>

                <Separator />

                <Text fontSize="xs" fontWeight="bold">
                  Chart Pool Progress: {currentCharts}/{totalCharts} Charts Drafted ({selectedCharts} Selected to Play)
                </Text>

                {/* Timeline Container */}
                <VStack 
                  align="stretch" 
                  gap={2} 
                  h={{ base: "180px", md: "240px" }} 
                  overflowY="auto" 
                  pr={1}
                >
                  {steps.length === 0 ? (
                    <Box h="100%" display="flex" alignItems="center" justifyContent="center" borderWidth="1px" borderStyle="dashed" borderRadius="md" px={4}>
                      <Text fontSize="xs" color="fg.muted" fontStyle="italic" textAlign="center">
                        No operations added yet. Click any of the shortcut action buttons above to start mapping your flow.
                      </Text>
                    </Box>
                  ) : (
                    steps.map((step, idx) => {
                      const actColor = actionColors[step.action];
                      const entColor = actorColors[step.actor];

                      return (
                        <HStack
                          key={idx}
                          p={2}
                          borderWidth="1px"
                          borderRadius="sm"
                          justify="space-between"
                          bg="bg.panel"
                          _hover={{ bg: "bg.muted" }}
                        >
                          <HStack gap={3}>
                            <Box
                              fontSize="xs"
                              fontWeight="bold"
                              bg="bg.emphasized"
                              w="24px"
                              h="24px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              borderRadius="full"
                            >
                              {idx + 1}
                            </Box>

                            <Box fontSize="xs" fontWeight="bold" px={2} py={0.5} borderRadius="sm" color={`${entColor}.600`}>
                              {step.actor}
                            </Box>

                            <LuArrowRight size={12} style={{ color: "var(--chakra-colors-fg-muted)" }} />

                            <Box fontSize="xs" fontWeight="black" px={2} py={0.5} borderRadius="sm" bg={`${actColor}.600`} color="white">
                              {step.action}
                            </Box>
                          </HStack>

                          <IconButton
                            size="xs"
                            variant="outline"
                            colorPalette="red"
                            onClick={() => handleRemoveStep(idx)}
                            aria-label="Delete step row"
                          >
                            <LuTrash2 />
                          </IconButton>
                        </HStack>
                      );
                    })
                  )}
                  <div ref={timelineBottomRef} />
                </VStack>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="outline" onClick={resetForm} disabled={loading}>
                Cancel
              </Button>
              <Button 
                type="submit"
                colorPalette="green" 
                variant="subtle" 
                loading={loading} 
                // Form remains disabled until name exists and steps are configured
                disabled={!rulesetName.trim() || steps.length === 0}
              >
                Save Ruleset Flow
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}