import { useState } from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'

import { handleStartRound } from '../../handlers/handleStartRound'
import { StatusElement } from '../StatusElement'
import { toaster } from '../ui/toaster'

import type { Round } from '../../types/Round'
import type { PlayerRound } from '../../types/PlayerRound'
import type { Stage } from '../../types/Stage'
import EditableRoundName from '../tourney/EditableRoundName'
import { handleUpdateRoundName } from '../../handlers/handleUpdateRoundName'


interface RoundDetailsProps {
  round: Round | null
  setRound: (round: Round | null) => void
  players: PlayerRound[] | null
  stages: Stage[] | null
  loading: boolean
  error: Error | null
  tourneyId: number
  admin: boolean
  loadingAdmin: boolean
}

const toasterErrorTitleText = 'Failed to Start Round';

export function RoundDetails({ round, setRound, players, stages, loading, error, tourneyId, admin, loadingAdmin }: RoundDetailsProps) {
  // Rename round logic
  const [updatingName, setUpdatingName] = useState(false);
  const onRenameRound = async (newName: string) => {
    if (!round) return;
    try {
      setUpdatingName(true);
      const updatedRound = await handleUpdateRoundName(round.id, newName);
      setRound(updatedRound);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingName(false);
    }
  };

  const [isStarting, setIsStarting] = useState(false);
  const handleStartRoundClick = async () => {
    if (!round) return;
    if (!players || players.length < 2) {
      toaster.create({ title: toasterErrorTitleText, description: 'Need at least 2 players', type: 'error', closable: true });
      return;
    }

    if (!stages || stages.length < 1) {
      toaster.create({ title: toasterErrorTitleText, description: 'Need at least 1 stage', type: 'error', closable: true });
      return;
    }

    if (stages.every(stage => !stage.chart_pools || stage.chart_pools.length === 0)) {
      toaster.create({ title: toasterErrorTitleText, description: 'Need at least 1 chart per stage', type: 'error', closable: true });
      return;
    }

    try {
      setIsStarting(true);
      const {updatedRound} = await handleStartRound(round.id);
      setRound({...updatedRound[0]});
      toaster.create({
        title: "Round Started",
        description: `Round "${round.name}" is now in progress.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: toasterErrorTitleText,
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
    } finally {
      setIsStarting(false);
    }
  };

  const roundNameText = (
    <>
      {!loadingAdmin && admin ?
        <EditableRoundName
          roundId={round?.id ?? 0}
          tourneyId={tourneyId}
          roundName={round?.name ?? ''}
          onRename={onRenameRound}
          isLoading={updatingName}
        /> :
        <Text>{round?.name ?? ''}</Text>
      }
    </>
  );
  return (
    <>
      <title>{round && round.name ? round.name : 'Round Details'}</title>
      <Heading mb={2}>{roundNameText}</Heading>
      <Box>
        <VStack style={{gap: '0px'}}>
        {loading && <Text>Loading round...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        {!loading && !error && !round && <Text>Round ID not found.</Text>}
        {!loading && !error && round && (
          <>
            <StatusElement element={round} />
            <Text>Players Advancing: {round.players_advancing}</Text>
            {!loadingAdmin && admin && round?.status === "Not Started" && (
              <Button colorPalette="green" onClick={handleStartRoundClick} mt={2} loading={isStarting}>
                Start Round
              </Button>
            )}
          </>
        )}
        </VStack>
      </Box>
    </>
  )
}