import { useState, useMemo } from "react";
import {
  Badge,
  Box,
  HStack,
  Text,
  Select,
  Span,
  Spinner,
  Portal,
  createListCollection
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { handleAddRoundPoolToRuleset } from "../../../handlers/roundpool/handleAddRoundPoolToRuleset";
import { handleRemoveRoundPoolFromRuleset } from "../../../handlers/roundpool/handleRemoveRoundPoolFromRuleset";
import { toaster } from "../../ui/toaster";

import type { RoundPool } from "../../../types/RoundPool";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";

interface RoundPoolsListProps {
  chartdrawConfig: ChartdrawConfigWithSpecs;
  roundPools: RoundPool[];
  setRoundPools: React.Dispatch<React.SetStateAction<RoundPool[]>>;
}

export default function RoundPoolsList({
  chartdrawConfig,
  roundPools = [],
  setRoundPools
}: RoundPoolsListProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);
  const [selectValue, setSelectValue] = useState<string[]>([]);

  // Loading trackers
  const [isAdding, setIsAdding] = useState(false);
  const [deletingPoolId, setDeletingPoolId] = useState<number | null>(null);

  const matchingPools = roundPools.filter(
    (pool) => pool.chartdraw_config_id === chartdrawConfig.id
  );

  // Filter out pools that are already active to prevent duplicates in the dropdown
  const collection = useMemo(() => {
    const unappliedPools = roundPools.filter(
      (p) => !matchingPools.some((mp) => mp.id === p.id)
    );
    return createListCollection({
      items: unappliedPools.map((pool) => ({
        label: pool.name,
        value: String(pool.id),
      })),
    });
  }, [roundPools, matchingPools]);

  // Dropdown Insertion Action
  const onSelectRoundPool = async (roundPoolIdString: string) => {
    if (!roundPoolIdString) return;
    if (!chartdrawConfig || !chartdrawConfig.id) {
      toaster.create({
        title: "Configuration Error",
        description: "Could not link pool because ruleset configuration data is missing.",
        type: "error",
      });
      return;
    }
    const poolId = Number(roundPoolIdString);
    setIsAdding(true);
    try {
      await handleAddRoundPoolToRuleset(poolId, chartdrawConfig.id);
      setRoundPools((prev) =>
        prev.map((pool) =>
          pool.id === poolId
            ? { ...pool, chartdraw_config_id: chartdrawConfig.id }
            : pool
        )
      );
      setSelectValue([]);
      toaster.create({
        title: "Pool Attached",
        description: "Successfully added round pool!",
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Action Failed",
        description: err.message || "Failed to add pool!",
        type: "error",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Badge Delete Action
  const onRemoveRoundPool = async (poolId: number, roundPoolName: string) => {
    setDeletingPoolId(poolId);
    try {
      await handleRemoveRoundPoolFromRuleset(poolId);
      setRoundPools(prev =>
        prev.map(pool => pool.id === poolId ? { ...pool, chartdraw_config_id: undefined } : pool)
      );
      toaster.create({
        title: "Pool Detached",
        description: `Successfully removed ${roundPoolName} constraint.`,
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Action Failed",
        description: err.message || "Failed to remove pool linkage.",
        type: "error",
      });
    } finally {
      setDeletingPoolId(null);
    }
  };

  return (
    <Box>
      {matchingPools.length > 0 ? (
        <HStack gap={2} flexWrap="wrap" alignItems="center" width="100%">
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" whiteSpace="nowrap">
            Applied to all Rounds in:
          </Text>
          <HStack gap={1.5} flexWrap="wrap" display="inline-flex">
            {matchingPools.map((pool) => {
              const isThisPoolDeleting = deletingPoolId === pool.id;

              return (
                <Badge
                  key={pool.id}
                  colorPalette="blue"
                  variant="subtle"
                  size="sm"
                  p={0}
                  display="inline-flex"
                  alignItems="stretch"
                  overflow="hidden"
                >
                  {/* Round Pool Name */}
                  <HStack px={2} py={1} gap={1.5} alignItems="center" h="100%">
                    {isThisPoolDeleting && (
                      <Spinner size="xs" borderWidth="2px" />
                    )}
                    <Span color="white" fontWeight="medium">
                      {pool.name}
                    </Span>
                  </HStack>

                  {/* TO Feature: remove the Round Pool button */}
                  {!loadingTourneyAdminStatus && isTourneyAdmin && (
                    <Box
                      as="button"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      px={2}
                      cursor="pointer"
                      transition="all 0.15s"
                      borderLeft="1px solid"
                      borderColor="whiteAlpha.300"
                      bg="blackAlpha.50"
                      color="whiteAlpha.800"
                      _hover={{
                        bg: "blackAlpha.250",
                        color: "white"
                      }}
                      _active={{ bg: "blackAlpha.400" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRoundPool(pool.id, pool.name);
                      }}
                      aria-label="Delete range spec"
                    >
                      <LuX size={10} strokeWidth={3.5} />
                    </Box>
                  )}
                </Badge>
              );
            })}
          </HStack>
        </HStack>
      ) : (
        <Text fontSize="xs" color="fg.muted" fontStyle="italic">
          Not currently assigned to any Rounds.
        </Text>
      )}

      {/* TO Feature: Add Round Pool */}
      {!loadingTourneyAdminStatus && isTourneyAdmin && collection.items.length > 0 && (
        <Box mt={3}>
          <HStack gap={2} alignItems="center">
            <Text fontSize="xs" fontWeight="medium" color="fg.muted" display="inline-flex" alignItems="center" gap={1}>
              Add:
            </Text>

            <Select.Root
              collection={collection}
              size="sm"
              width={"full"}
              value={selectValue}
              disabled={isAdding || deletingPoolId !== null}
              onValueChange={(details) => {
                setSelectValue(details.value);
                const selectedRoundPoolIdString = details.value[0];
                if (selectedRoundPoolIdString) {
                  onSelectRoundPool(selectedRoundPoolIdString);
                }
              }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger
                  fontSize="xs"
                  borderWidth={2}
                  borderColor="blue.800"
                  focusRingColor="blue.700"
                  _hover={{ borderColor: "blue.700" }}
                >
                  {isAdding ? (
                    <HStack gap={2} alignItems="center">
                      <Spinner size="xs" color="blue.500" borderWidth="2px" />
                      <Span color="gray.500" fontWeight="medium" fontStyle="italic">
                        Attaching...
                      </Span>
                    </HStack>
                  ) : (
                    <Select.ValueText placeholder="Select round pool to assign..." />
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
                      <Select.Item key={item.value} item={item} fontSize="xs">
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </HStack>
        </Box>
      )}
    </Box>
  );
}