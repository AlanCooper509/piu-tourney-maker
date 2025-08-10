import { Box, Heading, Text } from '@chakra-ui/react';
import type { Round } from '../types/Round';

interface RoundListProps {
  rounds: Round[] | null;
  loading: boolean;
  error: Error | null;
}

export function RoundsList({ rounds, loading, error }: RoundListProps) {
  return (
    <Box>
      <Heading mb={2}>Rounds</Heading>
      {loading && <Text>Loading rounds...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {!loading && !error && rounds?.length ? (
        rounds.map((round) => (
          <Box key={round.id} mb={2} borderWidth="1px" borderRadius="md" p={2}>
            <Text fontWeight="bold">{round.name} (ID: {round.id})</Text>
            <Text>Status: {round.status ?? 'Unknown'}</Text>
            <Text>Players Advancing: {round.players_advancing}</Text>
            <Text>Previous Round ID: {round.previous_round_id ?? 'None'}</Text>
          </Box>
        ))
      ) : (
        !loading && !error && <Text>No rounds found.</Text>
      )}
    </Box>
  );
}