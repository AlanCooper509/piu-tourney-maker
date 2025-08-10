import { Box, Heading, Text } from '@chakra-ui/react'
import type { Tourney } from '../types/Tourney'

interface TourneyDetailsProps {
  tourney: Tourney | null
  loading: boolean
  error: Error | null
}

export function TourneyDetails({ tourney, loading, error }: TourneyDetailsProps) {
  return (
    <>
      <title>{tourney && tourney.name ? tourney.name : 'Tournament Details'}</title>
      <Box>
      <Heading mb={2}>Tournament Details</Heading>
      {loading && <Text>Loading tournament...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {!loading && !error && tourney && (
        <>
        <Text>Name: {tourney.name}</Text>
        <Text>Type: {tourney.type}</Text>
        <Text>Status: {tourney.status}</Text>
        </>
      )}
      </Box>
    </>
  )
}