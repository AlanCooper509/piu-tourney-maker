import { Box, Heading, Text } from '@chakra-ui/react'
import type { PlayerTourney } from '../../types/PlayerTourney'

interface PlayersListProps {
  players: PlayerTourney[] | null
  loading: boolean
  error: Error | null
  admin: boolean
  loadingAdmin: boolean
}

export function PlayersList({ players, loading, error, admin, loadingAdmin }: PlayersListProps) {
  const adminText = (
    <>
      {loadingAdmin && <Text>Loading admin status...</Text>}
      {admin ?
        <Text>(You are an admin for this tournament, you can add/modify players)</Text> :
        <Text>(You are not an admin for this tournament, you cannot add/modify players)</Text>
      }
    </>
  );

  return (
    <Box>
      <Heading mb={2}>Players</Heading>
      {loading && <Text>Loading players...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {adminText}
      {!loading && !error && players?.length ? (
        players.map(p => <Text key={p.id}>{p.player_name}</Text>)
      ) : (
        !loading && !error && <Text>No players found.</Text>
      )}
    </Box>
  )
}