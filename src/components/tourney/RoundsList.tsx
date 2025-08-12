import { Box, Heading, Text } from '@chakra-ui/react';
import type { Round } from '../../types/Round';
import { Link } from 'react-router-dom';

interface RoundListProps {
  rounds: Round[] | null;
  loading: boolean;
  error: Error | null;
  admin: boolean;
  loadingAdmin: boolean;
}

export function RoundsList({ rounds, loading, error, admin, loadingAdmin }: RoundListProps) {
  const adminText = (
    <>
      {loadingAdmin && <Text>Loading admin status...</Text>}
      {admin ?
        <Text>(You are an admin for this tournament, you can add/modify rounds)</Text> :
        <Text>(You are not an admin for this tournament, you cannot add/modify rounds)</Text>
      }
    </>
  );

  return (
    <Box>
      <Heading mb={2}>Rounds</Heading>
      {loading && <Text>Loading rounds...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {adminText}
      {!loading && !error && rounds?.length ? (
        rounds.map((round) => (
          <Box key={round.id} mb={2} borderWidth="1px" borderRadius="md" p={2}>
            <Text fontWeight="bold"><Link to={`/tourney/${round.tourney_id}/round/${round.id}`}>{round.name}</Link> (ID: {round.id})</Text>
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