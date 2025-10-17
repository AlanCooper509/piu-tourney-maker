import { useState } from 'react'
import { Box, Heading, VStack, Text, IconButton } from '@chakra-ui/react'


import EditableTourneyName from './EditableTourneyName'
import { handleUpdateTourneyName } from '../../handlers/handleUpdateTourneyName'
import { handleStartTourney } from '../../handlers/handleStartTourney'
import { toaster } from '../ui/toaster'
import { StatusElement } from '../StatusElement'
import { useCurrentTourney } from '../../context/CurrentTourneyContext'
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";

import type { Round } from '../../types/Round'
import type { PlayerTourney } from '../../types/PlayerTourney'

interface TourneyDetailsProps {
  players: PlayerTourney[] | null
  rounds: Round[] | null
  loading: boolean
  error: Error | null
}

export function TourneyDetails({ players, rounds, loading, error }: TourneyDetailsProps) {
  const { tourney, setTourney } = useCurrentTourney();
  if (!tourney) return null;
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(Number(tourney.id));

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
      const {updatedTourney} = await handleStartTourney(tourney.id);
      setTourney(updatedTourney[0]);
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
      {!loadingTourneyAdminStatus && isTourneyAdmin ?
        <EditableTourneyName
          tourneyName={tourney?.name ?? ''}
          onRename={onRenameTourney}
          isLoading={updatingName}
        /> :
        <Text></Text>
      }
    </>
  );
  return (
    <>
      <title>{tourney && tourney.name ? tourney.name : 'Tournament Details'}</title>
      <Heading mb={-2}>{tourneyNameText}</Heading>
      <Box>
        <VStack style={{gap: '0px'}}>
          {loading && <Text>Loading tournament...</Text>}
          {error && <Text color="red">Error: {error.message}</Text>}
          {!loading && !error && tourney && (
          <>
            <Text>Type: {tourney.type}</Text>
            <StatusElement element={tourney} />
            {!loadingTourneyAdminStatus && isTourneyAdmin && tourney?.status === "Not Started" && (
              <IconButton 
                colorPalette="green"
                variant="outline"
                borderWidth={2}
                size="sm"
                onClick={handleStartTourneyClick}
                mt={2}
                px={2}
                loading={isStarting}
              >
                Start Tourney
              </IconButton>
            )}
          </>
        )}
        </VStack>
      </Box>
    </>
  )
}