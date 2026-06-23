import { useState } from 'react'
import { Box, Heading, VStack, Text, IconButton, HStack } from '@chakra-ui/react'


import { useCurrentTourney } from '../../context/CurrentTourneyContext'
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import EditableTourneyName from './EditableTourneyName'
import GenerateBracketButton from './GenerateBracketButton/GenerateBracketButton';
import SeedPlayersButton from './SeedPlayersButton/SeedPlayersButton'
import ChartRulesButton from './ChartRulesButton/ChartRulesButton';
import { handleUpdateTourneyName } from '../../handlers/handleUpdateTourneyName'
import { StatusElement } from '../StatusElement'
import { toaster } from '../ui/toaster'
import { handleStartTourney } from '../../handlers/handleStartTourney'

import type { Round } from '../../types/Round'
import type { PlayerTourney } from '../../types/PlayerTourney'
import type { RoundPool } from '../../types/RoundPool';
import type { ChartdrawConfigWithSpecs } from '../../types/ChartDrawConfig';

interface TourneyDetailsProps {
  players: PlayerTourney[] | null
  rounds: Round[] | null
  roundPools: RoundPool[] | null
  chartdrawConfigs: ChartdrawConfigWithSpecs[] | null
  loading: boolean
  error: Error | null
}

export function TourneyDetails({ players, rounds, roundPools, chartdrawConfigs, loading, error}: TourneyDetailsProps) {
  const { tourney, setTourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney( tourney?.id ?? undefined );
  const [updatingName, setUpdatingName] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Rename tourney logic
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
      const {updatedTourney} = await handleStartTourney({
        tourneyId: tourney.id,
        seedPlayersIntoEarliestRound: tourney.type === "Gauntlet",
      });
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
            {!loadingTourneyAdminStatus && isTourneyAdmin && tourney?.status === "Not Started" && (
              <HStack mb={4}>
                {tourney.type === "Double Elimination" && (
                  <>
                    <GenerateBracketButton 
                      players={players}
                      buttonText={rounds && rounds.length > 0 ? "Regenerate Bracket" : "Generate Bracket"}
                    />
                    <ChartRulesButton
                      chartdrawConfigs={chartdrawConfigs}
                      roundPools={roundPools}
                    />
                  </>
                )}
                {/* TODO: Archive this Seed Players button after migrating existing Gauntlet/Waterfall functionality to GenerateBracketButton */}
                {tourney.type !== "Double Elimination" && (
                  <>
                    <SeedPlayersButton 
                      players={players}
                      rounds={rounds}
                    />
                  </>
                )}
                <IconButton 
                  colorPalette="green"
                  variant="outline"
                  borderWidth={2}
                  size="sm"
                  onClick={handleStartTourneyClick}
                  px={2}
                  loading={isStarting}
                >
                  Start Tourney
                </IconButton>
              </HStack>
            )}
            <Text>Type: {tourney.type}</Text>
            <StatusElement element={tourney} />
          </>
        )}
        </VStack>
      </Box>
    </>
  )
}