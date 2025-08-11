import { Box, Heading, Text } from '@chakra-ui/react'
import type { Tourney } from '../types/Tourney'

interface TourneyDetailsProps {
  tourney: Tourney | null
  loading: boolean
  error: Error | null
  admin: boolean
  loadingAdmin: boolean
}

export function TourneyDetails({ tourney, loading, error, admin, loadingAdmin }: TourneyDetailsProps) {
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
      <title>{tourney && tourney.name ? tourney.name : 'Tournament Details'}</title>
      <Box>
        <Heading mb={2}>Tournament Details</Heading>
        {loading && <Text>Loading tournament...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        {!loading && !error && tourney && (
          <>
            {adminText}
            <Text>Name: {tourney.name}</Text>
            <Text>Type: {tourney.type}</Text>
            <Text>Status: {tourney.status}</Text>
          </>
        )}
      </Box>
    </>
  )
}