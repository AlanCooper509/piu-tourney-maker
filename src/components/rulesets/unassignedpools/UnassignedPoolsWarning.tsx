import { Badge, Box, Card, Collapsible, HStack, Text } from "@chakra-ui/react";
import { LuTriangleAlert, LuChevronDown } from "react-icons/lu";
import type { RoundPool } from "../../../types/RoundPool";

interface UnassignedPoolsWarningProps {
  unassignedPools: RoundPool[];
}

export default function UnassignedPoolsWarning({ unassignedPools }: UnassignedPoolsWarningProps) {
  if (unassignedPools.length === 0) return null;

  return (
    <Collapsible.Root>
      <Card.Root variant="outline" size="sm" borderWidth={1} borderColor="orange.700">
        <Card.Body>
          {/* Trigger Area */}
          <Collapsible.Trigger width="100%">
            <HStack justifyContent="space-between" gap={2}>
                <HStack gap={2}>
                  <LuTriangleAlert size={16} color="orange" />
                  <Text fontSize="sm" fontWeight="semibold">
                    {unassignedPools.length} Round Pool{unassignedPools.length !== 1 ? "s" : ""} missing rulesets
                  </Text>
                </HStack>
                <Collapsible.Indicator>
                  <LuChevronDown />
                </Collapsible.Indicator>
              </HStack>
          </Collapsible.Trigger>

          {/* Collapsible Content */}
          <Collapsible.Content>
            <Box pt={4} px={1} width="100%">
              <HStack gap={1.5} flexWrap="wrap" justifyContent="center">
                {unassignedPools.map((pool) => (
                  <Badge
                    key={pool.id}
                    colorPalette="orange"
                    variant="subtle"
                    size="sm"
                  >
                    {pool.name}
                  </Badge>
                ))}
              </HStack>
            </Box>
          </Collapsible.Content>
        </Card.Body>
      </Card.Root>
    </Collapsible.Root>
  );
}