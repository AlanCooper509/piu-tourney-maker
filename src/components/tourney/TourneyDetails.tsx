import { useState } from 'react'
import { Box, Button, Heading, VStack, HStack, Text } from '@chakra-ui/react'

import EditableTourneyName from './EditableTourneyName'
import { handleUpdateTourneyName } from '../../handlers/handleUpdateTourneyName'
import type { Tourney } from '../../types/Tourney'
import { LiveIndicator } from '../ui/LiveIndicator'
import { handleStartTourney } from '../../handlers/handleStartTourney'
import { toaster } from '../ui/toaster'
import type { Round } from '../../types/Round'
import type { PlayerTourney } from '../../types/PlayerTourney'

interface TourneyDetailsProps {
  tourney: Tourney | null
  setTourney: (tourney: Tourney | null) => void
  players: PlayerTourney[] | null
  rounds: Round[] | null
  loading: boolean
  error: Error | null
  admin: boolean
  loadingAdmin: boolean
}

export function TourneyDetails({ tourney, setTourney, players, rounds, loading, error, admin, loadingAdmin }: TourneyDetailsProps) {
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

  const [isStarting, setIsStarting] = useState(false);
  const handleStartTourneyClick = async () => {
    if (!tourney) return;
    if (!players || players.length < 2) {
      toaster.create({ title: 'Error', description: 'Need at least 2 players', type: 'error', closable: true });
      return;
    }

    if (!rounds || rounds.length < 1) {
      toaster.create({ title: 'Error', description: 'Need at least 1 round', type: 'error', closable: true });
      return;
    }
    try {
      setIsStarting(true);
      const updated = await handleStartTourney(tourney.id);
      setTourney(updated[0]);
      toaster.create({
        title: "Tournament Started",
        description: `Tournament "${tourney.name}" is now in progress.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to Start Tournament",
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
    } finally {
      setIsStarting(false);
    }
  };

  const tourneyNameText = (
    <>
      {!loadingAdmin && admin ?
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
      <Heading size="2xl" mb={2}>
        {tourneyNameText}
      </Heading>
      <Box>
        <VStack style={{gap: '0px'}}>
        {loading && <Text>Loading tournament...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        {!loading && !error && tourney && (
          <>
            <Text>Type: {tourney.type}</Text>
            <HStack style={{gap: '0px'}}>
              <Text mr={2}>Status: {tourney.status}</Text>
              {tourney.status === 'In Progress' && <LiveIndicator />}
            </HStack>
            {!loadingAdmin && admin && tourney?.status !== "In Progress" && (
              <Button colorPalette="green" onClick={handleStartTourneyClick} mt={2} loading={isStarting}>
                Start Tourney
              </Button>
            )}
          </>
        )}
        </VStack>
      </Box>
    </>
  )
}