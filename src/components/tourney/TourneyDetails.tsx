import { useState } from 'react'
import { Box, Heading, VStack, HStack, Text } from '@chakra-ui/react'

import EditableTourneyName from './EditableTourneyName'
import { handleUpdateTourneyName } from '../../handlers/handleUpdateTourneyName'
import type { Tourney } from '../../types/Tourney'
import { LiveIndicator } from '../ui/LiveIndicator'

interface TourneyDetailsProps {
  tourney: Tourney | null
  setTourney: (tourney: Tourney | null) => void
  loading: boolean
  error: Error | null
  admin: boolean
  loadingAdmin: boolean
}

export function TourneyDetails({ tourney, setTourney, loading, error, admin, loadingAdmin }: TourneyDetailsProps) {
  const adminText = (
    <>
      {loadingAdmin && <Text>Loading admin status...</Text>}
      {admin ?
        <Text>(You are an admin for this tournament, you can modify details)</Text> :
        <Text>(You are not an admin for this tournament, you cannot modify details)</Text>
      }
    </>
  );

  // Rename tourney logic
  const [updatingName, setUpdatingName] = useState(false);
  const onRenameTourney = async (newName: string) => {
    if (!tourney) return;
    try {
      setUpdatingName(true);
      const updatedTourney = await handleUpdateTourneyName(tourney.id, newName);
      setTourney(updatedTourney); // Update local tourney state
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingName(false);
    }
  };

  const tourneyNameText = (
    <>
      {admin ?
        <EditableTourneyName
          tourneyName={tourney?.name ?? ''}
          onRename={onRenameTourney}
          isLoading={updatingName}
        /> :
        <Text>{tourney?.name ?? ''}</Text>
      }
    </>
  );
  return (
    <>
      <title>{tourney && tourney.name ? tourney.name : 'Tournament Details'}</title>
      <Heading mb={2}>
        {tourneyNameText}
      </Heading>
      <Box>
        <VStack style={{gap: '0px'}}>
        {loading && <Text>Loading tournament...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        {!loading && !error && tourney && (
          <>
            {adminText}
            <Text>Type: {tourney.type}</Text>
            <HStack style={{gap: '0px'}}>
              <Text mr={2}>Status: {tourney.status}</Text>
              {tourney.status === 'In Progress' && <LiveIndicator />}
            </HStack>
          </>
        )}
        </VStack>
      </Box>
    </>
  )
}