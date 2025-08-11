import { Box, Heading, Text } from '@chakra-ui/react'
import type { Round } from '../../types/Round'

interface RoundDetailsProps {
  round: Round | null
  loading: boolean
  error: Error | null
  admin: boolean
  loadingAdmin: boolean
}

export function RoundDetails({ round, loading, error, admin, loadingAdmin }: RoundDetailsProps) {
  const adminText = (
    <>
      {loadingAdmin && <Text>Loading admin status...</Text>}
      {admin ?
        <Text>(You are an admin for this tournament, you can modify details)</Text> :
        <Text>(You are not an admin for this tournament, you cannot modify details)</Text>
      }
    </>
  );
  
  return (
    <>
      <title>{round && round.name ? round.name : 'Round Details'}</title>
      <Box>
        <Heading mb={2}>Round Details</Heading>
        {loading && <Text>Loading round...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        {!loading && !error && !round && <Text>Round ID not found.</Text>}
        {!loading && !error && round && (
          <>
            {adminText}
            <Text>Name: {round.name}</Text>
            <Text>Status: {round.status}</Text>
            <Text>Players Advancing: {round.players_advancing}</Text>
            <Text>Current: (ID) {round.id}</Text>
            <Text>Previous: (ID) {round.previous_round_id ? round.previous_round_id : "None"}</Text>
          </>
        )}
      </Box>
    </>
  )
}