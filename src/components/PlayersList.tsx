import { Box, Heading, Text } from '@chakra-ui/react'
import type { PlayerTourney } from '../types/PlayerTourney'

interface PlayersListProps {
  players: PlayerTourney[] | null
  loading: boolean
  error: Error | null
}

export function PlayersList({ players, loading, error }: PlayersListProps) {
  return (
    <Box>
      <Heading mb={2}>Players</Heading>
      {loading && <Text>Loading players...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {!loading && !error && players?.length ? (
        players.map(p => <Text key={p.id}>{p.player_name}</Text>)
      ) : (
        !loading && !error && <Text>No players found.</Text>
      )}
    </Box>
  )
}