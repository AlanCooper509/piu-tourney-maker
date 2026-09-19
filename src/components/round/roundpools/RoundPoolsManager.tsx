import { Badge, Box, Button, Center, Collapsible, Heading, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoAddCircleSharp, IoChevronForward } from "react-icons/io5";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";

import RoundPoolModal from "./RoundPoolModal";
import DeleteRoundPoolButton from "./DeleteRoundPoolButton";
import { toaster } from "../../ui/toaster";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { handleUpdateRoundPoolSortOrder } from "../../../handlers/roundpool/handleUpdateRoundPoolSortOrder";

import type { RoundPool } from "../../../types/RoundPool";
import type { Round } from "../../../types/Round";

interface RoundPoolsManagerProps {
  tourneyId: number;
  roundPools: RoundPool[];
  setRoundPools: React.Dispatch<React.SetStateAction<RoundPool[]>>;
  rounds: Round[];
}

export default function RoundPoolsManager({
  tourneyId,
  roundPools,
  setRoundPools,
  rounds,
}: RoundPoolsManagerProps) {
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourneyId);
  const [isOpen, setIsOpen] = useState(false);

  if (loadingTourneyAdminStatus || !isTourneyAdmin) return null;

  const effectiveOrder = (pool: RoundPool) => pool.sort_order ?? pool.id;
  const sortedPools = [...roundPools].sort((a, b) => effectiveOrder(a) - effectiveOrder(b));

  const onSaved = (saved: RoundPool) => {
    setRoundPools((prev) =>
      prev.some((p) => p.id === saved.id)
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [...prev, saved]
    );
  };

  const nextSortOrder = sortedPools.length
    ? Math.max(...sortedPools.map(effectiveOrder)) + 1
    : 0;

  const swapOrder = async (poolA: RoundPool, poolB: RoundPool) => {
    const orderA = effectiveOrder(poolA);
    const orderB = effectiveOrder(poolB);
    try {
      const [updatedA, updatedB] = await Promise.all([
        handleUpdateRoundPoolSortOrder(poolA.id, orderB),
        handleUpdateRoundPoolSortOrder(poolB.id, orderA),
      ]);
      setRoundPools((prev) =>
        prev.map((p) => {
          if (p.id === updatedA.id) return updatedA;
          if (p.id === updatedB.id) return updatedB;
          return p;
        })
      );
    } catch (err: any) {
      toaster.create({
        title: "Reorder Failed",
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
    }
  };

  return (
    <Box w="100%" maxW={{ base: "100%", md: "700px" }} mx="auto">
      <Collapsible.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
        <HStack justifyContent="center" gap={2} my={2}>
          <Collapsible.Trigger asChild cursor="pointer">
            <HStack gap={2}>
              <IoChevronForward
                style={{
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
              <Heading size="md">Round Pools ({sortedPools.length})</Heading>
            </HStack>
          </Collapsible.Trigger>
          <RoundPoolModal
            tourneyId={tourneyId}
            nextSortOrder={nextSortOrder}
            onSaved={onSaved}
            trigger={
              <Button size="sm" variant="outline" borderWidth={2} colorPalette="green" px={2}>
                Add <IoAddCircleSharp />
              </Button>
            }
          />
        </HStack>

        <Collapsible.Content>
          <Box pt={1}>
            {sortedPools.length === 0 ? (
              <Center w="100%" mt={2}>
                <Text>No round pools yet.</Text>
              </Center>
            ) : (
              <VStack align="stretch" gap={1}>
                {sortedPools.map((pool, index) => {
                  const roundCount = rounds.filter((r) => r.round_pool_id === pool.id).length;
                  return (
                    <HStack key={pool.id} justify="space-between" borderWidth={1} borderRadius="md" px={3} py={2}>
                      <HStack gap={2} minW={0} flex={1}>
                        <HStack gap={1} flexShrink={0}>
                          <IconButton
                            aria-label="Move pool up"
                            size="xs"
                            variant="outline"
                            disabled={index === 0}
                            onClick={() => swapOrder(pool, sortedPools[index - 1])}
                          >
                            <LuArrowUp />
                          </IconButton>
                          <IconButton
                            aria-label="Move pool down"
                            size="xs"
                            variant="outline"
                            disabled={index === sortedPools.length - 1}
                            onClick={() => swapOrder(pool, sortedPools[index + 1])}
                          >
                            <LuArrowDown />
                          </IconButton>
                        </HStack>
                        <Text
                          fontWeight="semibold"
                          truncate
                          title={pool.name}
                          color={roundCount === 0 ? "orange.400" : undefined}
                        >
                          {pool.name}
                        </Text>
                        <Badge colorPalette={roundCount === 0 ? "red" : "gray"} variant="subtle" flexShrink={0}>
                          {roundCount} round{roundCount !== 1 ? "s" : ""}
                        </Badge>
                      </HStack>
                      <HStack gap={1} flexShrink={0}>
                        <RoundPoolModal
                          tourneyId={tourneyId}
                          pool={pool}
                          nextSortOrder={nextSortOrder}
                          onSaved={onSaved}
                          trigger={
                            <IconButton aria-label="Rename pool" size="xs" variant="outline" colorPalette="blue">
                              <CiEdit />
                            </IconButton>
                          }
                        />
                        <DeleteRoundPoolButton pool={pool} roundCount={roundCount} setRoundPools={setRoundPools} />
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}
