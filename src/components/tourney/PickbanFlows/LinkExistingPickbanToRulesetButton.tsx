import { Select, Span, Spinner } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { HStack, Text, Portal, createListCollection } from "@chakra-ui/react";
import { handleLinkPickBanFlow } from "../../../handlers/pickban/handleLinkPickBanFlow";
import { toaster } from "../../ui/toaster";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";

interface LinkExistingPickbanToRulesetSelectProps {
  configId: number;
  pickbanRulesets: PickbanRulesetWithSteps[];
}

export default function LinkExistingPickbanToRulesetSelect({
  configId,
  pickbanRulesets,
}: LinkExistingPickbanToRulesetSelectProps) {
  const [isLinking, setIsLinking] = useState(false);
  const collection = useMemo(() => {
    return createListCollection({
      items: pickbanRulesets.map((ruleset) => ({
        label: `${ruleset.name} (${ruleset.pickban_ruleset_steps?.length || 0} steps)`,
        value: String(ruleset.id),
      })),
    });
  }, [pickbanRulesets]);

  const handleSelectExisting = async (rulesetIdStr: string) => {
    if (!rulesetIdStr) return;

    setIsLinking(true);
    try {
      await handleLinkPickBanFlow(configId, Number(rulesetIdStr));

      toaster.create({
        title: "Ruleset Linked",
        description: "Successfully applied the existing ruleset configuration.",
        type: "success",
      });

    } catch (err: any) {
      toaster.create({
        title: "Link Action Failed",
        description: err.message || "Could not link the requested ruleset.",
        type: "error",
      });
      setIsLinking(false);
    } finally {
      // don't need to setIsLinking(false) if successful; it'll get unmounted
    }
  };

  return (
    <HStack gap={2} alignItems="center">
      <Text fontSize="sm" whiteSpace="nowrap" fontWeight="medium">
        Add Existing:
      </Text>

      <Select.Root
        collection={collection}
        size="sm"
        width="240px"
        disabled={isLinking || pickbanRulesets.length === 0}
        onValueChange={(details) => {
          const selectedId = details.value[0];
          if (selectedId) handleSelectExisting(selectedId);
        }}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger
            fontSize="xs"
            borderWidth={2}
            borderColor="green.800"
            focusRingColor="green.700"
            _hover={{ borderColor: "green.700" }}
          >
            {isLinking ? (
              <HStack gap={2} alignItems="center">
                <Spinner size="xs" color="green.800" borderWidth="2px" />
                <Span color="green.800" fontWeight="medium" fontStyle="italic">
                  Linking...
                </Span>
              </HStack>
            ) : (
              <Select.ValueText
                placeholder={pickbanRulesets.length === 0 ? "No available rulesets" : "Select Pick/Ban template..."}
              />
            )}
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
    </HStack>
  );
}