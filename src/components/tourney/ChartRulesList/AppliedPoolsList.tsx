import { Badge, Box, HStack, Text } from "@chakra-ui/react";
import type { RoundPool } from "../../../types/RoundPool";

interface AppliedPoolsListProps {
  matchingPools: RoundPool[];
}

export default function AppliedPoolsList({ matchingPools }: AppliedPoolsListProps) {
  return (
    <Box borderTopWidth="1px" borderColor="border.subtle" pb={3}>
      {matchingPools.length > 0 ? (
        <HStack gap={2} flexWrap="wrap" alignItems="center" width="100%">
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" whiteSpace="nowrap">
            Applied to all Rounds in:
          </Text>
          <HStack gap={1.5} flexWrap="wrap" display="inline-flex">
            {matchingPools.map((pool) => (
              <Badge
                key={pool.id}
                colorPalette="blue"
                variant="subtle"
                size="sm"
              >
                {pool.name}
              </Badge>
            ))}
          </HStack>
        </HStack>
      ) : (
        <Text fontSize="xs" color="fg.muted" fontStyle="italic">
          Not currently assigned to any Rounds.
        </Text>
      )}
    </Box>
  );
}